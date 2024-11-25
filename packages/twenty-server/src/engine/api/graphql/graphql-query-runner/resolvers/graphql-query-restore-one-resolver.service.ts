import { Injectable } from '@nestjs/common';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { RestoreOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

@Injectable()
export class GraphqlQueryRestoreOneResolverService extends GraphqlQueryBaseResolverService<
  RestoreOneResolverArgs,
  ObjectRecord
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<RestoreOneResolverArgs>,
  ): Promise<ObjectRecord> {
    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;

    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const nonFormattedRestoredObjectRecords = await queryBuilder
      .restore()
      .where({ id: executionArgs.args.id })
      .returning('*')
      .execute();

    const formattedRestoredRecords = formatResult<ObjectRecord[]>(
      nonFormattedRestoredObjectRecords.raw,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    this.apiEventEmitterService.emitRestoreEvents(
      formattedRestoredRecords,
      authContext,
      objectMetadataItemWithFieldMaps,
    );

    if (formattedRestoredRecords.length === 0) {
      throw new GraphqlQueryRunnerException(
        'Record not found',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const restoredRecord = formattedRestoredRecords[0];

    const processNestedRelationsHelper = new ProcessNestedRelationsHelper();

    if (executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      await processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: [restoredRecord],
        relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
        limit: QUERY_MAX_RECORDS,
        authContext,
        dataSource: executionArgs.dataSource,
      });
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return typeORMObjectRecordsParser.processRecord({
      objectRecord: restoredRecord,
      objectName: objectMetadataItemWithFieldMaps.nameSingular,
      take: 1,
      totalCount: 1,
    });
  }

  async validate(
    args: RestoreOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    assertMutationNotOnRemoteObject(options.objectMetadataItemWithFieldMaps);
    assertIsValidUuid(args.id);
  }
}
