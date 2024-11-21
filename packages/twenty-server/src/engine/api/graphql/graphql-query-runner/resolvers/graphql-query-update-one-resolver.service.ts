import { Injectable } from '@nestjs/common';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { formatData } from 'src/engine/twenty-orm/utils/format-data.util';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

@Injectable()
export class GraphqlQueryUpdateOneResolverService extends GraphqlQueryBaseResolverService<
  UpdateOneResolverArgs,
  ObjectRecord
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<UpdateOneResolverArgs>,
  ): Promise<ObjectRecord> {
    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;

    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const data = formatData(
      executionArgs.args.data,
      objectMetadataItemWithFieldMaps,
    );

    const existingRecordBuilder = queryBuilder.clone();

    const existingRecords = (await existingRecordBuilder
      .where({ id: executionArgs.args.id })
      .getMany()) as ObjectRecord[];

    const formattedExistingRecords = formatResult<ObjectRecord[]>(
      existingRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    const nonFormattedUpdatedObjectRecords = await queryBuilder
      .update(data)
      .where({ id: executionArgs.args.id })
      .returning('*')
      .execute();

    const formattedUpdatedRecords = formatResult<ObjectRecord[]>(
      nonFormattedUpdatedObjectRecords.raw,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    this.apiEventEmitterService.emitUpdateEvents(
      formattedExistingRecords,
      formattedUpdatedRecords,
      Object.keys(executionArgs.args.data),
      authContext,
      objectMetadataItemWithFieldMaps,
    );

    if (formattedUpdatedRecords.length === 0) {
      throw new GraphqlQueryRunnerException(
        'Record not found',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const updatedRecord = formattedUpdatedRecords[0];

    const processNestedRelationsHelper = new ProcessNestedRelationsHelper();

    if (executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      await processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: [updatedRecord],
        relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
        limit: QUERY_MAX_RECORDS,
        authContext,
        dataSource: executionArgs.dataSource,
      });
    }

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
    args: UpdateOneResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    assertMutationNotOnRemoteObject(options.objectMetadataItemWithFieldMaps);
    assertIsValidUuid(args.id);
  }
}
