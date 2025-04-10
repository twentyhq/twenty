import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';
import { In, InsertResult, ObjectLiteral } from 'typeorm';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
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
    featureFlagsMap: Record<FeatureFlagKey, boolean>,
  ): Promise<ObjectRecord[]> {
    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;

    const { roleId } = executionArgs;

    const objectRecords = await this.insertOrUpsertRecords(executionArgs);

    const upsertedRecords = await this.fetchUpsertedRecords(
      executionArgs,
      objectRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    this.apiEventEmitterService.emitCreateEvents(
      upsertedRecords,
      authContext,
      objectMetadataItemWithFieldMaps,
    );

    await this.processNestedRelationsIfNeeded(
      executionArgs,
      upsertedRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      featureFlagsMap,
      roleId,
    );

    return this.formatRecordsForResponse(
      upsertedRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      featureFlagsMap,
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

    await this.processRecordsToUpdate(
      recordsToUpdate,
      executionArgs.repository,
      objectMetadataItemWithFieldMaps,
      result,
    );

    await this.processRecordsToInsert(
      recordsToInsert,
      executionArgs.repository,
      result,
    );

    return result;
  }

  private getConflictingFields(
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
  ): {
    baseField: string;
    fullPath: string;
    column: string;
  }[] {
    return objectMetadataItemWithFieldMaps.fields
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

    return queryBuilder.orWhere(whereConditions).getMany();
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
  ): Record<string, any> {
    const whereConditions = {};

    for (const field of conflictingFields) {
      const fieldValues = records
        .map((record) => this.getValueFromPath(record, field.fullPath))
        .filter(Boolean);

      if (fieldValues.length > 0) {
        whereConditions[field.column] = In(fieldValues);
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

  private async processRecordsToUpdate(
    recordsToUpdate: Partial<ObjectRecord>[],
    repository: WorkspaceRepository<ObjectLiteral>,
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    result: InsertResult,
  ): Promise<void> {
    for (const record of recordsToUpdate) {
      const recordId = record.id as string;

      // TODO: we should align update and insert
      // For insert, formating is done in the server
      // While for update, formatting is done at the resolver level

      const formattedRecord = formatData(
        record,
        objectMetadataItemWithFieldMaps,
      );

      await repository.update(recordId, formattedRecord);
      result.identifiers.push({ id: recordId });
      result.generatedMaps.push({ id: recordId });
    }
  }

  private async processRecordsToInsert(
    recordsToInsert: Partial<ObjectRecord>[],
    repository: WorkspaceRepository<ObjectLiteral>,
    result: InsertResult,
  ): Promise<void> {
    if (recordsToInsert.length > 0) {
      const insertResult = await repository.insert(recordsToInsert);

      result.identifiers.push(...insertResult.identifiers);
      result.generatedMaps.push(...insertResult.generatedMaps);
      result.raw.push(...insertResult.raw);
    }
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
    featureFlagsMap: Record<FeatureFlagKey, boolean>,
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
      dataSource: executionArgs.dataSource,
      isNewRelationEnabled:
        featureFlagsMap[FeatureFlagKey.IsNewRelationEnabled],
      roleId,
    });
  }

  private formatRecordsForResponse(
    upsertedRecords: ObjectRecord[],
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
    featureFlagsMap: Record<FeatureFlagKey, boolean>,
  ): ObjectRecord[] {
    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(
        objectMetadataMaps,
        featureFlagsMap,
      );

    return upsertedRecords.map((record: ObjectRecord) =>
      typeORMObjectRecordsParser.processRecord({
        objectRecord: record,
        objectName: objectMetadataItemWithFieldMaps.nameSingular,
        take: 1,
        totalCount: 1,
      }),
    );
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
