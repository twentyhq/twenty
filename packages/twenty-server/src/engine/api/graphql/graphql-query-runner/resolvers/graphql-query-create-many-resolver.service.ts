import { Injectable } from '@nestjs/common';

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
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

@Injectable()
export class GraphqlQueryCreateManyResolverService extends GraphqlQueryBaseResolverService<
  CreateManyResolverArgs,
  ObjectRecord[]
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateManyResolverArgs>,
  ): Promise<ObjectRecord[]> {
    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;

    const objectRecords: InsertResult = !executionArgs.args.upsert
      ? await executionArgs.repository.insert(executionArgs.args.data)
      : await executionArgs.repository.upsert(executionArgs.args.data, {
          conflictPaths: ['id'],
          skipUpdateIfNoValuesChanged: true,
        });

    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const nonFormattedUpsertedRecords = await queryBuilder
      .where({
        id: In(objectRecords.generatedMaps.map((record) => record.id)),
      })
      .take(QUERY_MAX_RECORDS)
      .getMany();

    const upsertedRecords = formatResult<ObjectRecord[]>(
      nonFormattedUpsertedRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    this.apiEventEmitterService.emitCreateEvents(
      upsertedRecords,
      authContext,
      objectMetadataItemWithFieldMaps,
    );

    const processNestedRelationsHelper = new ProcessNestedRelationsHelper();

    if (executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      await processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: upsertedRecords,
        relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
        limit: QUERY_MAX_RECORDS,
        authContext,
        dataSource: executionArgs.dataSource,
      });
    }

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
