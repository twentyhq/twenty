import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { FindOperator, In, InsertResult, ObjectLiteral } from 'typeorm';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataFromObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/utils/get-object-metadata-from-object-metadata-Item-with-field-maps';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

@Injectable()
export class GraphqlQueryCreateManyResolverService extends GraphqlQueryBaseResolverService<
  CreateManyResolverArgs,
  ObjectRecord[]
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
  ): Promise<ObjectRecord[]> {
    const { objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;

    const { roleId } = executionArgs;

    const objectRecords = await this.insertOrUpsertRecords(executionArgs);

    const upsertedRecords = await this.fetchUpsertedRecords(
      executionArgs,
      objectRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    const shouldBypassPermissionChecks = executionArgs.isExecutedByApiKey;

    await this.processNestedRelationsIfNeeded(
      executionArgs,
      upsertedRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      shouldBypassPermissionChecks,
      roleId,
    );

    return this.formatRecordsForResponse(
      upsertedRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );
  }

  private async insertOrUpsertRecords(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
  ): Promise<InsertResult> {
    if (!executionArgs.args.upsert) {
      return await executionArgs.repository.insert(executionArgs.args.data);
    }

    return this.performUpsertOperation(executionArgs);
  }

  private async performUpsertOperation(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
  ): Promise<InsertResult> {
    const { objectMetadataItemWithFieldMaps } = executionArgs.options;
    const conflictingFields = this.getConflictingFields(
      objectMetadataItemWithFieldMaps,
    );
    const existingRecords = await this.findExistingRecords(
      executionArgs,
      conflictingFields,
    );

    const { recordsToUpdate, recordsToInsert } = this.categorizeRecords(
      executionArgs.args.data,
      conflictingFields,
      existingRecords,
    );

    const result: InsertResult = {
      identifiers: [],
      generatedMaps: [],
      raw: [],
    };

    await this.processRecordsToUpdate({
      partialRecordsToUpdate: recordsToUpdate,
      existingRecords,
      repository: executionArgs.repository,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps: executionArgs.options.objectMetadataMaps,
      result,
      authContext: executionArgs.options.authContext,
    });

    await this.processRecordsToInsert({
      recordsToInsert,
      repository: executionArgs.repository,
      result,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps: executionArgs.options.objectMetadataMaps,
      authContext: executionArgs.options.authContext,
    });

    return result;
  }

  //TODO : Improve conflicting fields logic - unicity can be define on combination of fields - should be based on unique index not on field metadata
  //TODO : https://github.com/twentyhq/core-team-issues/issues/1115
  private getConflictingFields(
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ): {
    baseField: string;
    fullPath: string;
    column: string;
  }[] {
    return Object.values(objectMetadataItemWithFieldMaps.fieldsById)
      .filter((field) => field.isUnique || field.name === 'id')
      .flatMap((field) => {
        const compositeType = compositeTypeDefinitions.get(field.type);

        if (!compositeType) {
          return [
            {
              baseField: field.name,
              fullPath: field.name,
              column: field.name,
            },
          ];
        }

        const property = compositeType.properties.find(
          (prop) => prop.isIncludedInUniqueConstraint,
        );

        return property
          ? [
              {
                baseField: field.name,
                fullPath: `${field.name}.${property.name}`,
                column: `${field.name}${capitalize(property.name)}`,
              },
            ]
          : [];
      });
  }

  private async findExistingRecords(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
    conflictingFields: {
      baseField: string;
      fullPath: string;
      column: string;
    }[],
  ): Promise<Partial<ObjectRecord>[]> {
    const { objectMetadataItemWithFieldMaps } = executionArgs.options;
    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const whereConditions = this.buildWhereConditions(
      executionArgs.args.data,
      conflictingFields,
    );

    whereConditions.forEach((condition) => {
      queryBuilder.orWhere(condition);
    });

    return await queryBuilder.getMany();
  }

  private getValueFromPath(
    record: Partial<ObjectRecord>,
    path: string,
  ): unknown {
    const pathParts = path.split('.');

    if (pathParts.length === 1) {
      return record[path];
    }

    const [parentField, childField] = pathParts;

    return record[parentField]?.[childField];
  }

  private buildWhereConditions(
    records: Partial<ObjectRecord>[],
    conflictingFields: {
      baseField: string;
      fullPath: string;
      column: string;
    }[],
  ): Record<string, FindOperator<string>>[] {
    const whereConditions = [];

    for (const field of conflictingFields) {
      const fieldValues = records
        .map((record) => this.getValueFromPath(record, field.fullPath))
        .filter(Boolean);

      //TODO : Adapt to composite constraint - https://github.com/twentyhq/core-team-issues/issues/1115
      if (fieldValues.length > 0) {
        whereConditions.push({ [field.column]: In(fieldValues) });
      }
    }

    return whereConditions;
  }

  private categorizeRecords(
    records: Partial<ObjectRecord>[],
    conflictingFields: {
      baseField: string;
      fullPath: string;
      column: string;
    }[],
    existingRecords: Partial<ObjectRecord>[],
  ): {
    recordsToUpdate: Partial<ObjectRecord>[];
    recordsToInsert: Partial<ObjectRecord>[];
  } {
    const recordsToUpdate: Partial<ObjectRecord>[] = [];
    const recordsToInsert: Partial<ObjectRecord>[] = [];

    for (const record of records) {
      let existingRecord: Partial<ObjectRecord> | null = null;

      for (const field of conflictingFields) {
        const requestFieldValue = this.getValueFromPath(record, field.fullPath);

        const existingRec = existingRecords.find(
          (existingRecord) =>
            existingRecord[field.column] === requestFieldValue,
        );

        if (existingRec) {
          existingRecord = { ...record, id: existingRec.id };
          break;
        }
      }

      if (existingRecord) {
        recordsToUpdate.push({ ...record, id: existingRecord.id });
      } else {
        recordsToInsert.push(record);
      }
    }

    return { recordsToUpdate, recordsToInsert };
  }

  private async processRecordsToUpdate({
    partialRecordsToUpdate,
    existingRecords,
    repository,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
    result,
    authContext,
  }: {
    partialRecordsToUpdate: Partial<ObjectRecord>[];
    existingRecords: Partial<ObjectRecord>[];
    repository: WorkspaceRepository<ObjectLiteral>;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
    result: InsertResult;
    authContext: AuthContext;
  }): Promise<void> {
    for (const partialRecordToUpdate of partialRecordsToUpdate) {
      const recordId = partialRecordToUpdate.id as string;

      // we should not update an existing record's createdBy value
      const partialRecordToUpdateWithoutCreatedByUpdate =
        this.getRecordWithoutCreatedBy(
          partialRecordToUpdate,
          objectMetadataItemWithFieldMaps,
        );

      const formattedPartialRecordToUpdate = formatData(
        partialRecordToUpdateWithoutCreatedByUpdate,
        objectMetadataItemWithFieldMaps,
      );

      // TODO: we should align update and insert
      // For insert, formating is done in the server
      // While for update, formatting is done at the resolver level
      await repository.update(recordId, formattedPartialRecordToUpdate);

      result.identifiers.push({ id: recordId });
      result.generatedMaps.push({ id: recordId });

      const [updatedRecord] = await repository.find({
        where: { id: recordId },
      });

      if (!isDefined(updatedRecord)) {
        continue;
      }

      const record = formatResult<ObjectRecord>(
        updatedRecord,
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      );

      const existingRecord = formatResult<ObjectRecord>(
        existingRecords.find((record) => record.id === recordId),
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      );

      this.apiEventEmitterService.emitUpdateEvents({
        existingRecords: structuredClone([existingRecord]),
        records: structuredClone([record]),
        updatedFields: Object.keys(formattedPartialRecordToUpdate),
        authContext,
        objectMetadataItem:
          getObjectMetadataFromObjectMetadataItemWithFieldMaps(
            objectMetadataItemWithFieldMaps,
          ),
      });
    }
  }

  private async processRecordsToInsert({
    recordsToInsert,
    repository,
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
    result,
    authContext,
  }: {
    recordsToInsert: Partial<ObjectRecord>[];
    repository: WorkspaceRepository<ObjectLiteral>;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
    result: InsertResult;
    authContext: AuthContext;
  }): Promise<void> {
    const formattedInsertedRecords: ObjectRecord[] = [];

    if (recordsToInsert.length > 0) {
      const insertResult = await repository.insert(recordsToInsert);

      result.identifiers.push(...insertResult.identifiers);
      result.generatedMaps.push(...insertResult.generatedMaps);
      result.raw.push(...insertResult.raw);

      formattedInsertedRecords.push(
        ...insertResult.raw.map((record: ObjectRecord) =>
          formatResult<ObjectRecord>(
            record,
            objectMetadataItemWithFieldMaps,
            objectMetadataMaps,
          ),
        ),
      );
    }

    this.apiEventEmitterService.emitCreateEvents({
      records: structuredClone(formattedInsertedRecords),
      authContext,
      objectMetadataItem: getObjectMetadataFromObjectMetadataItemWithFieldMaps(
        objectMetadataItemWithFieldMaps,
      ),
    });
  }

  private async fetchUpsertedRecords(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
    objectRecords: InsertResult,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
  ): Promise<ObjectRecord[]> {
    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const nonFormattedUpsertedRecords = await queryBuilder
      .where({
        id: In(objectRecords.generatedMaps.map((record) => record.id)),
      })
      .take(QUERY_MAX_RECORDS)
      .getMany();

    return formatResult<ObjectRecord[]>(
      nonFormattedUpsertedRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );
  }

  private async processNestedRelationsIfNeeded(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
    upsertedRecords: ObjectRecord[],
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
    shouldBypassPermissionChecks: boolean,
    roleId?: string,
  ): Promise<void> {
    if (!executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      return;
    }

    await this.processNestedRelationsHelper.processNestedRelations({
      objectMetadataMaps,
      parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
      parentObjectRecords: upsertedRecords,
      relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
      limit: QUERY_MAX_RECORDS,
      authContext: executionArgs.options.authContext,
      workspaceDataSource: executionArgs.workspaceDataSource,
      roleId,
      shouldBypassPermissionChecks,
    });
  }

  private formatRecordsForResponse(
    upsertedRecords: ObjectRecord[],
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
  ): ObjectRecord[] {
    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return upsertedRecords.map((record: ObjectRecord) =>
      typeORMObjectRecordsParser.processRecord({
        objectRecord: record,
        objectName: objectMetadataItemWithFieldMaps.nameSingular,
        take: 1,
        totalCount: 1,
      }),
    );
  }

  private getRecordWithoutCreatedBy(
    record: Partial<ObjectRecord>,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ) {
    let recordWithoutCreatedByUpdate = record;

    const createdByFieldMetadataId =
      objectMetadataItemWithFieldMaps.fieldIdByName['createdBy'];
    const createdByFieldMetadata =
      objectMetadataItemWithFieldMaps.fieldsById[createdByFieldMetadataId];

    if (!isDefined(createdByFieldMetadata)) {
      throw new GraphqlQueryRunnerException(
        `Missing createdBy field metadata for object ${objectMetadataItemWithFieldMaps.nameSingular}`,
        GraphqlQueryRunnerExceptionCode.MISSING_SYSTEM_FIELD,
      );
    }

    if ('createdBy' in record && createdByFieldMetadata.isCustom === false) {
      const { createdBy: _createdBy, ...recordWithoutCreatedBy } = record;

      recordWithoutCreatedByUpdate = recordWithoutCreatedBy;
    }

    return recordWithoutCreatedByUpdate;
  }

  async validate<T extends ObjectRecord>(
    args: CreateManyResolverArgs<Partial<T>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    assertMutationNotOnRemoteObject(options.objectMetadataItemWithFieldMaps);

    args.data.forEach((record) => {
      if (record?.id) {
        assertIsValidUuid(record.id);
      }
    });
  }
}
