import { Injectable, Logger } from '@nestjs/common';

import {
  MUTATION_MAX_MERGE_RECORDS,
  QUERY_MAX_RECORDS,
} from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { MergeManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { FieldMetadataRelationSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

@Injectable()
export class GraphqlQueryMergeManyResolverService extends GraphqlQueryBaseResolverService<
  MergeManyResolverArgs,
  ObjectRecord
> {
  private readonly logger = new Logger(
    GraphqlQueryMergeManyResolverService.name,
  );

  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<MergeManyResolverArgs>,
  ): Promise<ObjectRecord> {
    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;
    const { ids, conflictPriorityIndex, dryRun } = executionArgs.args;
    const { roleId } = executionArgs;

    const recordsToMerge = await this.fetchRecordsToMerge(executionArgs, ids);

    const priorityRecord = this.validateAndGetPriorityRecord(
      recordsToMerge,
      ids,
      conflictPriorityIndex,
    );

    const mergedData = this.performDeepMerge(
      recordsToMerge,
      priorityRecord.id,
      objectMetadataItemWithFieldMaps,
    );

    if (dryRun) {
      return this.createDryRunResponse(
        priorityRecord,
        mergedData,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      );
    }

    const idsToDelete = ids.filter((id) => id !== priorityRecord.id);

    await this.migrateRelatedRecords(
      executionArgs,
      idsToDelete,
      priorityRecord.id,
    );

    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    await queryBuilder
      .softDelete()
      .whereInIds(idsToDelete)
      .returning('*')
      .execute();

    const updatedRecord = await this.updatePriorityRecord(
      executionArgs,
      priorityRecord.id,
      mergedData,
    );

    if (roleId) {
      await this.processNestedRelations({
        executionArgs,
        updatedRecords: [updatedRecord],
        authContext,
        roleId,
      });
    }

    return this.formatResponse(
      updatedRecord,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );
  }

  private async fetchRecordsToMerge(
    executionArgs: GraphqlQueryResolverExecutionArgs<MergeManyResolverArgs>,
    ids: string[],
  ): Promise<ObjectRecord[]> {
    const recordsToMerge = await executionArgs.repository.find({
      where: { id: In(ids) },
    });

    if (recordsToMerge.length !== ids.length) {
      throw new GraphqlQueryRunnerException(
        'One or more records not found',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
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
        const priorityValue = recordsWithValues.find(
          (item) => item.recordId === priorityRecordId,
        );

        if (priorityValue) {
          mergedResult[fieldName] = priorityValue.value;
        } else {
          mergedResult[fieldName] = recordsWithValues[0].value;
        }
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

    if (fieldMetadata?.isSystem) {
      return true;
    }

    return false;
  }

  private createDryRunResponse(
    priorityRecord: ObjectRecord,
    mergedData: Partial<ObjectRecord>,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
  ): ObjectRecord {
    const dryRunRecord = {
      ...priorityRecord,
      ...mergedData,
      id: uuidv4(),
      deletedAt: new Date().toISOString(),
    } as ObjectRecord;

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return typeORMObjectRecordsParser.processRecord({
      objectRecord: dryRunRecord,
      objectName: objectMetadataItemWithFieldMaps.nameSingular,
      take: 1,
      totalCount: 1,
    });
  }

  private async updatePriorityRecord(
    executionArgs: GraphqlQueryResolverExecutionArgs<MergeManyResolverArgs>,
    priorityRecordId: string,
    mergedData: Partial<ObjectRecord>,
  ): Promise<ObjectRecord> {
    const { objectMetadataItemWithFieldMaps } = executionArgs.options;

    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const columnsToReturn = buildColumnsToReturn({
      select: executionArgs.graphqlQuerySelectedFieldsResult.select,
      relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
    });

    const updatedObjectRecords = await queryBuilder
      .update()
      .set(mergedData)
      .where({ id: priorityRecordId })
      .returning(columnsToReturn)
      .execute();

    if (!updatedObjectRecords.generatedMaps.length) {
      throw new GraphqlQueryRunnerException(
        'Failed to update record',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const updatedRecord = updatedObjectRecords.generatedMaps[0] as ObjectRecord;

    return updatedRecord;
  }

  private async migrateRelatedRecords(
    executionArgs: GraphqlQueryResolverExecutionArgs<MergeManyResolverArgs>,
    fromIds: string[],
    toId: string,
  ): Promise<void> {
    const { objectMetadataMaps, objectMetadataItemWithFieldMaps } =
      executionArgs.options;

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
        const repository = executionArgs.workspaceDataSource.getRepository(
          relationField.objectMetadata.nameSingular,
          executionArgs.isExecutedByApiKey,
          executionArgs.roleId,
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
    executionArgs,
    updatedRecords,
    authContext,
    roleId,
  }: {
    executionArgs: GraphqlQueryResolverExecutionArgs<MergeManyResolverArgs>;
    updatedRecords: ObjectRecord[];
    authContext: AuthContext;
    roleId: string;
  }): Promise<void> {
    const { objectMetadataMaps, objectMetadataItemWithFieldMaps } =
      executionArgs.options;

    if (executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: updatedRecords,
        relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
        limit: QUERY_MAX_RECORDS,
        authContext,
        workspaceDataSource: executionArgs.workspaceDataSource,
        roleId,
        shouldBypassPermissionChecks:
          executionArgs.shouldBypassPermissionChecks,
        selectedFields: executionArgs.graphqlQuerySelectedFieldsResult.select,
      });
    }
  }

  private formatResponse(
    updatedRecord: ObjectRecord,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
  ): ObjectRecord {
    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return typeORMObjectRecordsParser.processRecord({
      objectRecord: updatedRecord,
      objectName: objectMetadataItemWithFieldMaps.nameSingular,
      take: 1,
      totalCount: 1,
    });
  }

  async validate(
    args: MergeManyResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    assertMutationNotOnRemoteObject(options.objectMetadataItemWithFieldMaps);

    if (!isDefined(options.objectMetadataItemWithFieldMaps.duplicateCriteria)) {
      throw new GraphqlQueryRunnerException(
        `Merge is only available for objects with duplicate criteria. Object '${options.objectMetadataItemWithFieldMaps.nameSingular}' does not have duplicate criteria defined.`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    const { ids, conflictPriorityIndex } = args;

    if (!ids || ids.length < 2) {
      throw new GraphqlQueryRunnerException(
        'At least 2 record IDs are required for merge',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (ids.length > MUTATION_MAX_MERGE_RECORDS) {
      throw new GraphqlQueryRunnerException(
        `Maximum ${MUTATION_MAX_MERGE_RECORDS} records can be merged at once`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    if (conflictPriorityIndex < 0 || conflictPriorityIndex >= ids.length) {
      throw new GraphqlQueryRunnerException(
        `Invalid conflict priority '${conflictPriorityIndex}'. Valid options for ${ids.length} records: 0-${ids.length - 1}`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
