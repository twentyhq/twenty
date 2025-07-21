import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { MergeManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { buildColumnsToReturn } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-return';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

type RecordFieldValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>;

type RelationMigrationTask = {
  tableName: string;
  columnName: string;
  standardId: string;
};

@Injectable()
export class GraphqlQueryMergeManyResolverService extends GraphqlQueryBaseResolverService<
  MergeManyResolverArgs,
  ObjectRecord
> {
  private readonly RELATION_MIGRATION_TASKS: RelationMigrationTask[] = [
    {
      tableName: 'person',
      columnName: 'companyId',
      standardId: STANDARD_OBJECT_IDS.person,
    },
    {
      tableName: 'opportunity',
      columnName: 'companyId',
      standardId: STANDARD_OBJECT_IDS.opportunity,
    },
    {
      tableName: 'taskTarget',
      columnName: 'companyId',
      standardId: STANDARD_OBJECT_IDS.taskTarget,
    },
    {
      tableName: 'noteTarget',
      columnName: 'companyId',
      standardId: STANDARD_OBJECT_IDS.noteTarget,
    },
    {
      tableName: 'favorite',
      columnName: 'companyId',
      standardId: STANDARD_OBJECT_IDS.favorite,
    },
    {
      tableName: 'attachment',
      columnName: 'companyId',
      standardId: STANDARD_OBJECT_IDS.attachment,
    },
    {
      tableName: 'timelineActivity',
      columnName: 'companyId',
      standardId: STANDARD_OBJECT_IDS.timelineActivity,
    },
  ];

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

    const mergedData = this.performDeepMerge(recordsToMerge, priorityRecord.id);

    if (dryRun) {
      return this.createDryRunResponse(
        priorityRecord,
        mergedData,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      );
    }

    const updatedRecord = await this.updatePriorityRecord(
      executionArgs,
      priorityRecord.id,
      mergedData,
    );

    const idsToDelete = ids.filter((id) => id !== priorityRecord.id);

    await this.migrateRelatedRecords(
      executionArgs,
      idsToDelete,
      priorityRecord.id,
    );

    await executionArgs.repository.delete({
      id: In(idsToDelete),
    });

    if (roleId) {
      await this.processNestedRelations(
        executionArgs,
        [updatedRecord],
        authContext,
        roleId,
      );
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
  ): Partial<ObjectRecord> {
    const mergedResult: Partial<ObjectRecord> = {};

    const allFieldNames = new Set<string>();

    recordsToMerge.forEach((record) => {
      Object.keys(record).forEach((fieldName) => {
        if (
          ![
            'id',
            'createdAt',
            'updatedAt',
            'deletedAt',
            'searchVector',
            'position',
          ].includes(fieldName)
        ) {
          allFieldNames.add(fieldName);
        }
      });
    });

    allFieldNames.forEach((fieldName) => {
      const recordsWithValues: { value: RecordFieldValue; recordId: string }[] =
        [];

      recordsToMerge.forEach((record) => {
        const fieldValue = record[fieldName];

        if (this.hasValue(fieldValue)) {
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

  private hasValue(value: RecordFieldValue): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim() !== '';
    }

    if (typeof value === 'number') {
      return !isNaN(value);
    }

    if (typeof value === 'boolean') {
      return true;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === 'object') {
      const objectValue = value as Record<string, unknown>;

      return Object.values(objectValue).some((val) =>
        this.hasValue(val as RecordFieldValue),
      );
    }

    return true;
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

    const updatedRecord = updatedObjectRecords.generatedMaps[0] as ObjectRecord;

    if (!updatedRecord) {
      throw new GraphqlQueryRunnerException(
        'Failed to update record',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    return updatedRecord;
  }

  private async migrateRelatedRecords(
    executionArgs: GraphqlQueryResolverExecutionArgs<MergeManyResolverArgs>,
    fromIds: string[],
    toId: string,
  ): Promise<void> {
    const { objectMetadataMaps } = executionArgs.options;

    for (const task of this.RELATION_MIGRATION_TASKS) {
      const metadata = Object.values(objectMetadataMaps.byId).find(
        (metadata) => metadata?.standardId === task.standardId,
      );

      if (!metadata) {
        continue;
      }

      const repository = executionArgs.workspaceDataSource.getRepository(
        metadata.nameSingular,
        executionArgs.isExecutedByApiKey,
        executionArgs.roleId,
      );

      await repository.update(
        { [task.columnName]: In(fromIds) },
        { [task.columnName]: toId },
      );
    }
  }

  private async processNestedRelations(
    executionArgs: GraphqlQueryResolverExecutionArgs<MergeManyResolverArgs>,
    updatedRecords: ObjectRecord[],
    authContext: AuthContext,
    roleId: string,
  ): Promise<void> {
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
        shouldBypassPermissionChecks: executionArgs.isExecutedByApiKey,
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

    if (options.objectMetadataItemWithFieldMaps.nameSingular !== 'company') {
      throw new Error('Merge is only available for company objects');
    }

    const { ids, conflictPriorityIndex } = args;

    if (!ids || ids.length < 2) {
      throw new Error('At least 2 record IDs are required for merge');
    }

    if (ids.length > 10) {
      throw new Error('Maximum 10 records can be merged at once');
    }

    if (conflictPriorityIndex < 0 || conflictPriorityIndex >= ids.length) {
      throw new Error(
        `Invalid conflict priority '${conflictPriorityIndex}'. Valid options for ${ids.length} records: 0-${ids.length - 1}`,
      );
    }
  }
}
