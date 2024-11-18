import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
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
import { GraphqlQuerySelectedFieldsResult } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { computeCursorArgFilter } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-cursor-arg-filter';
import {
  getCursor,
  getPaginationInfo,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class GraphqlQueryFindManyResolverService
  implements ResolverService<FindManyResolverArgs, IConnection<ObjectRecord>>
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async resolve<
    T extends ObjectRecord = ObjectRecord,
    Filter extends ObjectRecordFilter = ObjectRecordFilter,
    OrderBy extends ObjectRecordOrderBy = ObjectRecordOrderBy,
  >(
    args: FindManyResolverArgs<Filter, OrderBy>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<IConnection<T>> {
    const {
      authContext,
      objectMetadataItemWithFieldMaps,
      info,
      objectMetadataMaps,
    } = options;

    const dataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(
        authContext.workspace.id,
      );

    const repository = dataSource.getRepository(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const aggregateQueryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps.fieldsByName,
      objectMetadataMaps,
    );

    const withFilterAggregateQueryBuilder =
      graphqlQueryParser.applyFilterToBuilder(
        aggregateQueryBuilder,
        objectMetadataItemWithFieldMaps.nameSingular,
        args.filter ?? ({} as Filter),
      );

    const selectedFields = graphqlFields(info);

    const graphqlQuerySelectedFieldsResult: GraphqlQuerySelectedFieldsResult =
      graphqlQueryParser.parseSelectedFields(
        objectMetadataItemWithFieldMaps,
        selectedFields,
      );
    const isForwardPagination = !isDefined(args.before);

    const withDeletedAggregateQueryBuilder =
      graphqlQueryParser.applyDeletedAtToBuilder(
        withFilterAggregateQueryBuilder,
        args.filter ?? ({} as Filter),
      );

    const cursor = getCursor(args);

    let appliedFilters = args.filter ?? ({} as Filter);

    const orderByWithIdCondition = [
      ...(args.orderBy ?? []),
      { id: OrderByDirection.AscNullsFirst },
    ] as OrderBy;

    if (cursor) {
      const cursorArgFilter = computeCursorArgFilter(
        cursor,
        orderByWithIdCondition,
        objectMetadataItemWithFieldMaps.fieldsByName,
        isForwardPagination,
      );

      appliedFilters = (args.filter
        ? {
            and: [args.filter, { or: cursorArgFilter }],
          }
        : { or: cursorArgFilter }) as unknown as Filter;
    }

    const withFilterQueryBuilder = graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItemWithFieldMaps.nameSingular,
      appliedFilters,
    );

    const withOrderByQueryBuilder = graphqlQueryParser.applyOrderToBuilder(
      withFilterQueryBuilder,
      orderByWithIdCondition,
      objectMetadataItemWithFieldMaps.nameSingular,
      isForwardPagination,
    );

    const withDeletedQueryBuilder = graphqlQueryParser.applyDeletedAtToBuilder(
      withOrderByQueryBuilder,
      args.filter ?? ({} as Filter),
    );

    const isAggregationsEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsAggregateQueryEnabled,
        authContext.workspace.id,
      );

    if (!isAggregationsEnabled) {
      graphqlQuerySelectedFieldsResult.aggregate = {
        totalCount: graphqlQuerySelectedFieldsResult.aggregate.totalCount,
      };
    }

    const processAggregateHelper = new ProcessAggregateHelper();

    processAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
      selectedAggregatedFields: graphqlQuerySelectedFieldsResult.aggregate,
      queryBuilder: withDeletedAggregateQueryBuilder,
    });

    const limit = args.first ?? args.last ?? QUERY_MAX_RECORDS;

    const nonFormattedObjectRecords = await withDeletedQueryBuilder
      .take(limit + 1)
      .getMany();

    const objectRecords = formatResult(
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
      await withDeletedAggregateQueryBuilder.getRawOne();

    const processNestedRelationsHelper = new ProcessNestedRelationsHelper();

    if (graphqlQuerySelectedFieldsResult.relations) {
      await processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: objectRecords,
        parentObjectRecordsAggregatedValues,
        relations: graphqlQuerySelectedFieldsResult.relations,
        aggregate: graphqlQuerySelectedFieldsResult.aggregate,
        limit,
        authContext,
        dataSource,
      });
    }

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionHelper(objectMetadataMaps);

    return typeORMObjectRecordsParser.createConnection({
      objectRecords,
      objectRecordsAggregatedValues: parentObjectRecordsAggregatedValues,
      selectedAggregatedFields: graphqlQuerySelectedFieldsResult.aggregate,
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
