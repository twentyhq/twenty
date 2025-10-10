//TODO : Refacto-common - To delete
import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import {
  GraphqlQueryBaseResolverService,
  type GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import {
  type ObjectRecord,
  type ObjectRecordFilter,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { type FindOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';

@Injectable()
export class GraphqlQueryFindOneResolverService extends GraphqlQueryBaseResolverService<
  FindOneResolverArgs,
  ObjectRecord
> {
  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<FindOneResolverArgs>,
  ): Promise<ObjectRecord> {
    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;

    const { roleId } = executionArgs;

    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    executionArgs.graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItemWithFieldMaps.nameSingular,
      executionArgs.args.filter ?? ({} as ObjectRecordFilter),
    );

    executionArgs.graphqlQueryParser.applyDeletedAtToBuilder(
      queryBuilder,
      executionArgs.args.filter ?? ({} as ObjectRecordFilter),
    );

    const columnsToSelect = buildColumnsToSelect({
      select: executionArgs.graphqlQuerySelectedFieldsResult.select,
      relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    const objectRecord = await queryBuilder
      .setFindOptions({
        select: columnsToSelect,
      })
      .getOne();

    if (!objectRecord) {
      throw new GraphqlQueryRunnerException(
        'Record not found',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const objectRecords = [objectRecord] as ObjectRecord[];

    if (executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: objectRecords,
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

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return typeORMObjectRecordsParser.processRecord({
      objectRecord: objectRecords[0],
      objectName: objectMetadataItemWithFieldMaps.nameSingular,
      take: 1,
      totalCount: 1,
    }) as ObjectRecord;
  }

  async validate(
    args: FindOneResolverArgs<ObjectRecordFilter>,
    _options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    if (!args.filter || Object.keys(args.filter).length === 0) {
      throw new WorkspaceQueryRunnerException(
        'Missing filter argument',
        WorkspaceQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }
  }
}
