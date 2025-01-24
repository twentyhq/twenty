import { Injectable } from '@nestjs/common';

import {
  GraphqlQueryBaseResolverService,
  GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import {
  ObjectRecord,
  ObjectRecordFilter,
  ObjectRecordOrderBy,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QUERY_MAX_RECORDS } from 'src/engine/api/graphql/graphql-query-runner/constants/query-max-records.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { computeCursorArgFilter } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-cursor-arg-filter';
import {
  getCursor,
  getPaginationInfo,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class GraphqlQueryFindManyResolverService extends GraphqlQueryBaseResolverService<
  FindManyResolverArgs,
  IConnection<ObjectRecord>
> {
  constructor(private readonly featureFlagService: FeatureFlagService) {
    super();
  }

  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<FindManyResolverArgs>,
  ): Promise<IConnection<ObjectRecord>> {
    const { authContext, objectMetadataItemWithFieldMaps, objectMetadataMaps } =
      executionArgs.options;

    const queryBuilder = executionArgs.repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const aggregateQueryBuilder = queryBuilder.clone();

    let appliedFilters =
      executionArgs.args.filter ?? ({} as ObjectRecordFilter);

    executionArgs.graphqlQueryParser.applyFilterToBuilder(
      aggregateQueryBuilder,
      objectMetadataItemWithFieldMaps.nameSingular,
      appliedFilters,
    );

    executionArgs.graphqlQueryParser.applyDeletedAtToBuilder(
      aggregateQueryBuilder,
      appliedFilters,
    );

    const orderByWithIdCondition = [
      ...(executionArgs.args.orderBy ?? []),
      { id: OrderByDirection.AscNullsFirst },
    ] as ObjectRecordOrderBy;

    const isForwardPagination = !isDefined(executionArgs.args.before);

    const cursor = getCursor(executionArgs.args);

    if (cursor) {
      const cursorArgFilter = computeCursorArgFilter(
        cursor,
        orderByWithIdCondition,
        objectMetadataItemWithFieldMaps.fieldsByName,
        isForwardPagination,
      );

      appliedFilters = (executionArgs.args.filter
        ? {
            and: [executionArgs.args.filter, { or: cursorArgFilter }],
          }
        : { or: cursorArgFilter }) as unknown as ObjectRecordFilter;
    }

    executionArgs.graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItemWithFieldMaps.nameSingular,
      appliedFilters,
    );

    executionArgs.graphqlQueryParser.applyOrderToBuilder(
      queryBuilder,
      orderByWithIdCondition,
      objectMetadataItemWithFieldMaps.nameSingular,
      isForwardPagination,
    );

    executionArgs.graphqlQueryParser.applyDeletedAtToBuilder(
      queryBuilder,
      appliedFilters,
    );

    const processAggregateHelper = new ProcessAggregateHelper();

    processAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
      selectedAggregatedFields:
        executionArgs.graphqlQuerySelectedFieldsResult.aggregate,
      queryBuilder: aggregateQueryBuilder,
    });

    const limit =
      executionArgs.args.first ?? executionArgs.args.last ?? QUERY_MAX_RECORDS;

    const nonFormattedObjectRecords = await queryBuilder
      .take(limit + 1)
      .getMany();

    const objectRecords = formatResult<ObjectRecord[]>(
      nonFormattedObjectRecords,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    const { hasNextPage, hasPreviousPage } = getPaginationInfo(
      objectRecords,
      limit,
      isForwardPagination,
    );

    if (objectRecords.length > limit) {
      objectRecords.pop();
    }

    const parentObjectRecordsAggregatedValues =
      await aggregateQueryBuilder.getRawOne();

    const processNestedRelationsHelper = new ProcessNestedRelationsHelper();

    if (executionArgs.graphqlQuerySelectedFieldsResult.relations) {
      await processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: objectRecords,
        parentObjectRecordsAggregatedValues,
        relations: executionArgs.graphqlQuerySelectedFieldsResult.relations,
        aggregate: executionArgs.graphqlQuerySelectedFieldsResult.aggregate,
        limit,
        authContext,
        dataSource: executionArgs.dataSource,
      });
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return typeORMObjectRecordsParser.createConnection({
      objectRecords,
      objectRecordsAggregatedValues: parentObjectRecordsAggregatedValues,
      selectedAggregatedFields:
        executionArgs.graphqlQuerySelectedFieldsResult.aggregate,
      objectName: objectMetadataItemWithFieldMaps.nameSingular,
      take: limit,
      totalCount: parentObjectRecordsAggregatedValues?.totalCount,
      order: orderByWithIdCondition,
      hasNextPage,
      hasPreviousPage,
    });
  }

  async validate<Filter extends ObjectRecordFilter>(
    args: FindManyResolverArgs<Filter>,
    _options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    if (args.first && args.last) {
      throw new GraphqlQueryRunnerException(
        'Cannot provide both first and last',
        GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.before && args.after) {
      throw new GraphqlQueryRunnerException(
        'Cannot provide both before and after',
        GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.before && args.first) {
      throw new GraphqlQueryRunnerException(
        'Cannot provide both before and first',
        GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.after && args.last) {
      throw new GraphqlQueryRunnerException(
        'Cannot provide both after and last',
        GraphqlQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.first !== undefined && args.first < 0) {
      throw new GraphqlQueryRunnerException(
        'First argument must be non-negative',
        GraphqlQueryRunnerExceptionCode.INVALID_ARGS_FIRST,
      );
    }
    if (args.last !== undefined && args.last < 0) {
      throw new GraphqlQueryRunnerException(
        'Last argument must be non-negative',
        GraphqlQueryRunnerExceptionCode.INVALID_ARGS_LAST,
      );
    }
  }
}
