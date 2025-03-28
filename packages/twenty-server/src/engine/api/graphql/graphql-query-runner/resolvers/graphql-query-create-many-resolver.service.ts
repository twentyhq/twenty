import { Injectable } from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';
import { In, InsertResult } from 'typeorm';

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

    const uniqueFields = [
      ...objectMetadataItemWithFieldMaps.fields.filter(
        (field) => field.isUnique || field.name === 'id',
      ),
    ];

    const conflictingFields: string[] = [];

    uniqueFields.forEach((field) => {
      const compositeType = compositeTypeDefinitions.get(field.type);

      if (compositeType) {
        conflictingFields.push(
          compositeType.properties
            .filter((property) => property.isIncludedInUniqueConstraint)
            .map((property) => `${field.name}${capitalize(property.name)}`)
            .join(),
          // For now we assume that there is only one unique field per composite type
          // I believe this assumption has already been taken elsewhere in the codebase
        );
      } else {
        conflictingFields.push(field.name);
      }
    });

    const result: InsertResult = {
      identifiers: [],
      generatedMaps: [],
      raw: [],
    };

    const whereConditions = {};

    for (const field of conflictingFields) {
      const fieldValues = executionArgs.args.data
        .map((record) => record[field])
        .filter(Boolean);

      if (fieldValues.length > 0) {
        whereConditions[field] = In(fieldValues);
      }
    }

    const existingRecords = await executionArgs.repository.find({
      where: whereConditions,
    });

    const existingRecordMaps = conflictingFields.reduce((maps, field) => {
      maps[field] = new Map();
      existingRecords.forEach((record) => {
        if (record[field]) {
          maps[field].set(record[field], record);
        }
      });

      return maps;
    }, {});

    const recordsToUpdate: Partial<ObjectRecord>[] = [];
    const recordsToInsert: Partial<ObjectRecord>[] = [];

    for (const record of executionArgs.args.data) {
      let existingRecord: ObjectRecord | null = null;

      for (const field of conflictingFields) {
        if (record[field] && existingRecordMaps[field].has(record[field])) {
          existingRecord = existingRecordMaps[field].get(record[field]);
          break;
        }
      }

      if (existingRecord) {
        recordsToUpdate.push({ ...record, id: existingRecord.id });
      } else {
        recordsToInsert.push(record);
      }
    }

    for (const record of recordsToUpdate) {
      const recordId = record.id as string;

      // TODO: we should align update and insert
      // For insert, formating is done in the server
      // While for update, formatting is done at the resolver level

      const formattedRecord = formatData(
        record,
        objectMetadataItemWithFieldMaps,
      );

      await executionArgs.repository.update(recordId, formattedRecord);
      result.identifiers.push({ id: recordId });
      result.generatedMaps.push({ id: recordId });
    }

    if (recordsToInsert.length > 0) {
      const insertResult =
        await executionArgs.repository.insert(recordsToInsert);

      result.identifiers.push(...insertResult.identifiers);
      result.generatedMaps.push(...insertResult.generatedMaps);
      result.raw.push(...insertResult.raw);
    }

    return result;
  }

  private async fetchUpsertedRecords(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
    objectRecords: InsertResult,
    objectMetadataItemWithFieldMaps: any,
    objectMetadataMaps: any,
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
    objectMetadataItemWithFieldMaps: any,
    objectMetadataMaps: any,
    featureFlagsMap: Record<FeatureFlagKey, boolean>,
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
    });
  }

  private formatRecordsForResponse(
    upsertedRecords: ObjectRecord[],
    objectMetadataItemWithFieldMaps: any,
    objectMetadataMaps: any,
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
