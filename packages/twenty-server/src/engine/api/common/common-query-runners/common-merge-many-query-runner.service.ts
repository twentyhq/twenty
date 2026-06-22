import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import {
  MUTATION_MAX_MERGE_RECORDS,
  QUERY_MAX_RECORDS_FROM_RELATION,
} from 'twenty-shared/constants';
import {
  FieldMetadataSettingsMapping,
  FieldMetadataType,
  ObjectRecord,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FindOptionsRelations, In, ObjectLiteral } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  MergeManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { hasRecordFieldValue } from 'src/engine/api/graphql/graphql-query-runner/utils/has-record-field-value.util';
import { mergeFieldValues } from 'src/engine/api/graphql/graphql-query-runner/utils/merge-field-values.util';
import { WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

@Injectable()
export class CommonMergeManyQueryRunnerService extends CommonBaseQueryRunnerService<
  MergeManyQueryArgs,
  ObjectRecord
> {
  protected readonly operationName = CommonQueryNames.MERGE_MANY;

  async run(
    args: CommonExtendedInput<MergeManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<ObjectRecord> {
    const { flatFieldMetadataMaps, flatObjectMetadata } = queryRunnerContext;

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
      flatObjectMetadata,
      flatFieldMetadataMaps,
      args.dryRun ?? false,
    );

    if (args.dryRun) {
      return this.createDryRunResponse(priorityRecord, mergedData);
    }

    const idsToDelete = args.ids.filter((id) => id !== priorityRecord.id);

    const updatedRecord =
      await queryRunnerContext.workspaceDataSource.transaction(
        (transactionManager: WorkspaceEntityManager) =>
          this.executeMergeWithinTransaction(transactionManager, {
            args,
            queryRunnerContext,
            idsToDelete,
            priorityRecordId: priorityRecord.id,
            mergedData,
          }),
      );

    await this.processNestedRelations({
      args,
      queryRunnerContext,
      updatedRecords: [updatedRecord],
    });

    return updatedRecord;
  }

  private async executeMergeWithinTransaction(
    transactionManager: WorkspaceEntityManager,
    {
      args,
      queryRunnerContext,
      idsToDelete,
      priorityRecordId,
      mergedData,
    }: {
      args: CommonExtendedInput<MergeManyQueryArgs>;
      queryRunnerContext: CommonExtendedQueryRunnerContext;
      idsToDelete: string[];
      priorityRecordId: string;
      mergedData: Partial<ObjectRecord>;
    },
  ): Promise<ObjectRecord> {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    const columnsToReturn = buildColumnsToReturn({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const transactionRepository = transactionManager.getRepository(
      flatObjectMetadata.nameSingular,
      queryRunnerContext.rolePermissionConfig,
      queryRunnerContext.authContext,
    );

    await this.migrateRelatedRecords(
      transactionManager,
      queryRunnerContext,
      idsToDelete,
      priorityRecordId,
    );

    await transactionRepository
      .createQueryBuilder(flatObjectMetadata.nameSingular)
      .delete()
      .whereInIds(idsToDelete)
      .returning(columnsToReturn)
      .execute();

    return this.updatePriorityRecord(
      args,
      queryRunnerContext,
      transactionRepository,
      priorityRecordId,
      mergedData,
    );
  }

  private async fetchRecordsToMerge(
    context: CommonExtendedQueryRunnerContext,
    args: CommonExtendedInput<MergeManyQueryArgs>,
  ): Promise<ObjectRecord[]> {
    const columnsToSelect = buildColumnsToSelect({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      flatObjectMetadata: context.flatObjectMetadata,
      flatObjectMetadataMaps: context.flatObjectMetadataMaps,
      flatFieldMetadataMaps: context.flatFieldMetadataMaps,
    });

    const fetchedRecords = (await context.repository.find({
      where: { id: In(args.ids) },
      select: columnsToSelect,
    })) as ObjectRecord[];

    if (fetchedRecords.length !== args.ids.length) {
      throw new CommonQueryRunnerException(
        'One or more records not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        { userFriendlyMessage: msg`One or more records were not found.` },
      );
    }

    const orderIndex = new Map(args.ids.map((id, index) => [id, index]));

    fetchedRecords.sort(
      (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
    );

    const recordsToMerge = fetchedRecords;

    if (args.dryRun && args.selectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        flatObjectMetadataMaps: context.flatObjectMetadataMaps,
        flatFieldMetadataMaps: context.flatFieldMetadataMaps,
        parentObjectMetadataItem: context.flatObjectMetadata,
        parentObjectRecords: recordsToMerge,
        relations: args.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS_FROM_RELATION,
        authContext: context.authContext,
        workspaceDataSource: context.workspaceDataSource,
        rolePermissionConfig: context.rolePermissionConfig,
        selectedFields: args.selectedFieldsResult.select,
      });
    }

    return recordsToMerge;
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
      throw new CommonQueryRunnerException(
        'Priority record not found',
        CommonQueryRunnerExceptionCode.RECORD_NOT_FOUND,
        {
          userFriendlyMessage: msg`This record does not exist or has been deleted.`,
        },
      );
    }

    return priorityRecord;
  }

  private performDeepMerge(
    recordsToMerge: ObjectRecord[],
    priorityRecordId: string,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    isDryRun = false,
  ): Partial<ObjectRecord> {
    const mergedResult: Partial<ObjectRecord> = {};

    const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    const allFieldNames = new Set<string>();

    recordsToMerge.forEach((record) => {
      Object.keys(record).forEach((fieldName) => {
        if (
          !this.shouldExcludeFieldFromMerge(
            fieldName,
            fieldIdByName,
            flatFieldMetadataMaps,
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
        const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldIdByName[fieldName],
          flatEntityMaps: flatFieldMetadataMaps,
        });

        if (!fieldMetadata) {
          return;
        }

        const relationType =
          isDryRun && fieldMetadata.type === FieldMetadataType.RELATION
            ? (
                fieldMetadata.settings as FieldMetadataSettingsMapping['RELATION']
              )?.relationType
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
    fieldIdByName: Record<string, string>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): boolean {
    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldIdByName[fieldName],
      flatEntityMaps: flatFieldMetadataMaps,
    });

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
    repository: WorkspaceRepository<ObjectLiteral>,
    priorityRecordId: string,
    mergedData: Partial<ObjectRecord>,
  ): Promise<ObjectRecord> {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    const queryBuilder = repository.createQueryBuilder(
      flatObjectMetadata.nameSingular,
    );

    const columnsToReturn = buildColumnsToReturn({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
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
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const updatedRecord = updatedObjectRecords.generatedMaps[0] as ObjectRecord;

    return updatedRecord;
  }

  private async migrateRelatedRecords(
    transactionManager: WorkspaceEntityManager,
    context: CommonExtendedQueryRunnerContext,
    fromIds: string[],
    toId: string,
  ): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
    } = context;

    const relationFieldsPointingToCurrentObject: Array<{
      objectMetadata: FlatObjectMetadata;
      joinColumnName: string | undefined;
    }> = [];

    for (const field of Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      if (
        !isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) ||
        field.relationTargetObjectMetadataId !== flatObjectMetadata.id ||
        !field.isActive
      ) {
        continue;
      }

      const relationSettings = field.settings as
        | FieldMetadataSettingsMapping['RELATION']
        | undefined;

      if (relationSettings?.relationType !== RelationType.MANY_TO_ONE) {
        continue;
      }

      const objMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: field.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!objMetadata) {
        continue;
      }

      relationFieldsPointingToCurrentObject.push({
        objectMetadata: objMetadata,
        joinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: field.name,
        }),
      });
    }

    for (const relationField of relationFieldsPointingToCurrentObject) {
      if (!relationField.joinColumnName) {
        continue;
      }

      const repository = transactionManager.getRepository(
        relationField.objectMetadata.nameSingular,
        context.rolePermissionConfig,
        context.authContext,
      );

      // repository.update goes through the entity manager, which builds its
      // query without the transaction's query runner and would therefore run
      // outside the transaction. Build the query from the transaction-scoped
      // repository so the relation migration rolls back with the rest.
      await repository
        .createQueryBuilder(relationField.objectMetadata.nameSingular)
        .update()
        .set({ [relationField.joinColumnName]: toId })
        .where({ [relationField.joinColumnName]: In(fromIds) })
        .returning('*')
        .execute();
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
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatObjectMetadata,
      authContext,
      workspaceDataSource,
      rolePermissionConfig,
    } = queryRunnerContext;

    if (args.selectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        parentObjectMetadataItem: flatObjectMetadata,
        parentObjectRecords: updatedRecords,
        relations: args.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        limit: QUERY_MAX_RECORDS_FROM_RELATION,
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
    _flatObjectMetadata: FlatObjectMetadata,
    _flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    _flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    _authContext: WorkspaceAuthContext,
  ): Promise<ObjectRecord> {
    return queryResult;
  }

  async validate(
    args: CommonInput<MergeManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<void> {
    const { flatObjectMetadata } = queryRunnerContext;

    assertMutationNotOnRemoteObject(flatObjectMetadata);

    if (!isDefined(flatObjectMetadata.duplicateCriteria)) {
      throw new CommonQueryRunnerException(
        `Merge is only available for objects with duplicate criteria. Object '${flatObjectMetadata.nameSingular}' does not have duplicate criteria defined.`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: msg`This type of record cannot be merged.` },
      );
    }

    const { ids, conflictPriorityIndex } = args;

    if (!ids || ids.length < 2) {
      throw new CommonQueryRunnerException(
        'At least 2 record IDs are required for merge',
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        {
          userFriendlyMessage: msg`Please select at least 2 records to merge.`,
        },
      );
    }

    if (ids.length > MUTATION_MAX_MERGE_RECORDS) {
      throw new CommonQueryRunnerException(
        `Maximum ${MUTATION_MAX_MERGE_RECORDS} records can be merged at once`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        {
          userFriendlyMessage: msg`You can merge up to ${MUTATION_MAX_MERGE_RECORDS} records at once.`,
        },
      );
    }

    if (conflictPriorityIndex < 0 || conflictPriorityIndex >= ids.length) {
      throw new CommonQueryRunnerException(
        `Invalid conflict priority '${conflictPriorityIndex}'. Valid options for ${ids.length} records: 0-${ids.length - 1}`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }
}
