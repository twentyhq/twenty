import { Injectable, Logger } from '@nestjs/common';

import {
  MUTATION_MAX_MERGE_RECORDS,
  QUERY_MAX_RECORDS,
} from 'twenty-shared/constants';
import {
  FieldMetadataType,
  ObjectRecord,
  RelationType,
  FieldMetadataRelationSettings,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, In, ObjectLiteral } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  MergeManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';
import { mergeFieldValues } from 'src/engine/api/graphql/graphql-query-runner/utils/merge-field-values.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

@Injectable()
export class CommonMergeManyQueryRunnerService extends CommonBaseQueryRunnerService<
  MergeManyQueryArgs,
  ObjectRecord
> {
  protected readonly operationName = CommonQueryNames.MERGE_MANY;

  private readonly logger = new Logger(CommonMergeManyQueryRunnerService.name);
  async run(
    args: CommonExtendedInput<MergeManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord> {
    const { objectMetadataMaps, objectMetadataItemWithFieldMaps } =
      queryRunnerContext;

    const recordsToMerge = await this.fetchRecordsToMerge(
      queryRunnerContext,
      args,
    );

    const priorityRecord = this.validateAndGetPriorityRecord(
      recordsToMerge,
      args.ids,
      args.conflictPriorityIndex,
    );

    const mergedData = this.performDeepMerge(
      recordsToMerge,
      priorityRecord.id,
      objectMetadataItemWithFieldMaps,
      args.dryRun ?? false,
    );

    if (args.dryRun) {
      return this.createDryRunResponse(priorityRecord, mergedData);
    }

    const idsToDelete = args.ids.filter((id) => id !== priorityRecord.id);

    await this.migrateRelatedRecords(
      queryRunnerContext,
      idsToDelete,
      priorityRecord.id,
    );

    const queryBuilder = queryRunnerContext.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const columnsToReturn = buildColumnsToReturn({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    await queryBuilder
      .softDelete()
      .whereInIds(idsToDelete)
      .returning(columnsToReturn)
      .execute();

    const updatedRecord = await this.updatePriorityRecord(
      args,
      queryRunnerContext,
      priorityRecord.id,
      mergedData,
    );

    await this.processNestedRelations({
      args,
      queryRunnerContext,
      updatedRecords: [updatedRecord],
    });

    return updatedRecord;
  }

  private async fetchRecordsToMerge(
    context: CommonExtendedQueryRunnerContext,
    args: CommonExtendedInput<MergeManyQueryArgs>,
  ): Promise<ObjectRecord[]> {
    const columnsToSelect = buildColumnsToSelect({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps: context.objectMetadataItemWithFieldMaps,
      objectMetadataMaps: context.objectMetadataMaps,
    });

    const recordsToMerge = await context.repository.find({
      where: { id: In(args.ids) },
      select: columnsToSelect,
    });

    if (recordsToMerge.length !== args.ids.length) {
      throw new CommonQueryRunnerException(
        'One or more records not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    if (args.dryRun && args.selectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps: context.objectMetadataMaps,
        parentObjectMetadataItem: context.objectMetadataItemWithFieldMaps,
        parentObjectRecords: recordsToMerge as ObjectRecord[],
        relations: args.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS,
        authContext: context.authContext,
        workspaceDataSource: context.workspaceDataSource,
        rolePermissionConfig: context.rolePermissionConfig,
        selectedFields: args.selectedFieldsResult.select,
      });
    }

    return recordsToMerge as ObjectRecord[];
  }

  private validateAndGetPriorityRecord(
    recordsToMerge: ObjectRecord[],
    ids: string[],
    conflictPriorityIndex: number,
  ): ObjectRecord {
    const priorityRecordId = ids[conflictPriorityIndex];
    const priorityRecord = recordsToMerge.find(
      (record) => record.id === priorityRecordId,
    );

    if (!priorityRecord) {
      throw new GraphqlQueryRunnerException(
        'Priority record not found',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    return priorityRecord;
  }

  private performDeepMerge(
    recordsToMerge: ObjectRecord[],
    priorityRecordId: string,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    isDryRun = false,
  ): Partial<ObjectRecord> {
    const mergedResult: Partial<ObjectRecord> = {};

    const allFieldNames = new Set<string>();

    recordsToMerge.forEach((record) => {
      Object.keys(record).forEach((fieldName) => {
        if (
          !this.shouldExcludeFieldFromMerge(
            fieldName,
            objectMetadataItemWithFieldMaps,
          )
        ) {
          allFieldNames.add(fieldName);
        }
      });
    });

    allFieldNames.forEach((fieldName) => {
      const recordsWithValues: { value: unknown; recordId: string }[] = [];

      recordsToMerge.forEach((record) => {
        const fieldValue = record[fieldName];

        if (hasRecordFieldValue(fieldValue)) {
          recordsWithValues.push({ value: fieldValue, recordId: record.id });
        }
      });

      if (recordsWithValues.length === 0) {
        return;
      } else if (recordsWithValues.length === 1) {
        mergedResult[fieldName] = recordsWithValues[0].value;
      } else {
        const fieldMetadata = Object.values(
          objectMetadataItemWithFieldMaps.fieldsById,
        ).find((field) => field?.name === fieldName);

        if (!fieldMetadata) {
          return;
        }

        const relationType =
          isDryRun && fieldMetadata.type === FieldMetadataType.RELATION
            ? (fieldMetadata.settings as FieldMetadataRelationSettings)
                ?.relationType
            : undefined;

        mergedResult[fieldName] = mergeFieldValues(
          fieldMetadata.type,
          recordsWithValues,
          priorityRecordId,
          isDryRun,
          relationType,
        );
      }
    });

    return mergedResult;
  }

  private shouldExcludeFieldFromMerge(
    fieldName: string,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ): boolean {
    const fieldMetadata = Object.values(
      objectMetadataItemWithFieldMaps.fieldsById,
    ).find((field) => field?.name === fieldName);

    return fieldMetadata?.isSystem ?? false;
  }

  private createDryRunResponse(
    priorityRecord: ObjectRecord,
    mergedData: Partial<ObjectRecord>,
  ): ObjectRecord {
    const dryRunRecord: ObjectRecord = {
      ...priorityRecord,
      ...mergedData,
      id: uuidv4(),
      deletedAt: new Date().toISOString(),
    };

    return dryRunRecord;
  }

  private async updatePriorityRecord(
    args: CommonExtendedInput<MergeManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
    priorityRecordId: string,
    mergedData: Partial<ObjectRecord>,
  ): Promise<ObjectRecord> {
    const { objectMetadataItemWithFieldMaps, objectMetadataMaps, repository } =
      queryRunnerContext;

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const columnsToReturn = buildColumnsToReturn({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    const updatedObjectRecords = await queryBuilder
      .update()
      .set(mergedData)
      .where({ id: priorityRecordId })
      .returning(columnsToReturn)
      .execute();

    if (!updatedObjectRecords.generatedMaps.length) {
      throw new CommonQueryRunnerException(
        'Failed to update record',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const updatedRecord = updatedObjectRecords.generatedMaps[0] as ObjectRecord;

    return updatedRecord;
  }

  private async migrateRelatedRecords(
    context: CommonExtendedQueryRunnerContext,
    fromIds: string[],
    toId: string,
  ): Promise<void> {
    const { objectMetadataMaps, objectMetadataItemWithFieldMaps } = context;

    const relationFieldsPointingToCurrentObject = Object.values(
      objectMetadataMaps.byId,
    )
      .filter(isDefined)
      .flatMap((metadata) => {
        const relationFields = Object.values(metadata.fieldsById)
          .filter(isDefined)
          .filter((field) =>
            isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION),
          )
          .filter(
            (field) =>
              field.relationTargetObjectMetadataId ===
                objectMetadataItemWithFieldMaps.id && field.isActive,
          );

        return relationFields
          .filter((field) => {
            const relationSettings =
              field.settings as FieldMetadataRelationSettings;

            return (
              relationSettings?.relationType === RelationType.MANY_TO_ONE &&
              relationSettings?.joinColumnName
            );
          })
          .map((field) => {
            const relationSettings =
              field.settings as FieldMetadataRelationSettings;

            return {
              objectMetadata: metadata,
              fieldName: field.name,
              fieldId: field.id,
              joinColumnName: relationSettings.joinColumnName,
            };
          });
      });

    for (const relationField of relationFieldsPointingToCurrentObject) {
      if (!relationField.joinColumnName) {
        continue;
      }

      try {
        const repository = context.workspaceDataSource.getRepository(
          relationField.objectMetadata.nameSingular,
          context.rolePermissionConfig,
        );

        const whereCondition = { [relationField.joinColumnName]: In(fromIds) };

        const existingRecords = await repository.find({
          where: whereCondition,
        });

        if (existingRecords.length > 0) {
          await repository.update(whereCondition, {
            [relationField.joinColumnName]: toId,
          });
        }
      } catch (error) {
        this.logger.warn(
          `Failed to migrate relation field "${relationField.fieldName}" (${relationField.joinColumnName}) in object "${relationField.objectMetadata.nameSingular}":`,
          error.message,
        );
      }
    }
  }

  private async processNestedRelations({
    args,
    queryRunnerContext,
    updatedRecords,
  }: {
    args: CommonExtendedInput<MergeManyQueryArgs>;
    queryRunnerContext: CommonExtendedQueryRunnerContext;
    updatedRecords: ObjectRecord[];
  }): Promise<void> {
    const {
      objectMetadataMaps,
      objectMetadataItemWithFieldMaps,
      authContext,
      workspaceDataSource,
      rolePermissionConfig,
    } = queryRunnerContext;

    if (args.selectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: updatedRecords,
        relations: args.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS,
        authContext,
        workspaceDataSource,
        rolePermissionConfig,
        selectedFields: args.selectedFieldsResult.select,
      });
    }
  }

  async computeArgs(
    args: CommonInput<MergeManyQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<MergeManyQueryArgs>> {
    return args;
  }

  async processQueryResult(
    queryResult: ObjectRecord,
    _objectMetadataItemId: string,
    _objectMetadataMaps: ObjectMetadataMaps,
    _authContext: WorkspaceAuthContext,
  ): Promise<ObjectRecord> {
    return queryResult;
  }

  async validate(
    args: CommonInput<MergeManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<void> {
    const { objectMetadataItemWithFieldMaps } = queryRunnerContext;

    assertMutationNotOnRemoteObject(objectMetadataItemWithFieldMaps);

    if (!isDefined(objectMetadataItemWithFieldMaps.duplicateCriteria)) {
      throw new CommonQueryRunnerException(
        `Merge is only available for objects with duplicate criteria. Object '${objectMetadataItemWithFieldMaps.nameSingular}' does not have duplicate criteria defined.`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    const { ids, conflictPriorityIndex } = args;

    if (!ids || ids.length < 2) {
      throw new CommonQueryRunnerException(
        'At least 2 record IDs are required for merge',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (ids.length > MUTATION_MAX_MERGE_RECORDS) {
      throw new CommonQueryRunnerException(
        `Maximum ${MUTATION_MAX_MERGE_RECORDS} records can be merged at once`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (conflictPriorityIndex < 0 || conflictPriorityIndex >= ids.length) {
      throw new CommonQueryRunnerException(
        `Invalid conflict priority '${conflictPriorityIndex}'. Valid options for ${ids.length} records: 0-${ids.length - 1}`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
