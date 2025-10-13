import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import {
  ObjectRecord,
  ObjectRecordFilter,
  ObjectRecordOrderBy,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonPageInfo } from 'src/engine/api/common/types/common-page-info.type';
import {
  CommonQueryNames,
  FindManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { getPageInfo } from 'src/engine/api/common/utils/get-page-info.util';
import { isWorkspaceAuthContext } from 'src/engine/api/common/utils/is-workspace-auth-context.util';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { getCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { computeCursorArgFilter } from 'src/engine/api/utils/compute-cursor-arg-filter.utils';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonFindManyQueryRunnerService extends CommonBaseQueryRunnerService {
  async run({
    args,
    authContext: toValidateAuthContext,
    objectMetadataMaps,
    objectMetadataItemWithFieldMaps,
  }: {
    args: FindManyQueryArgs;
    authContext: AuthContext;
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  }): Promise<{
    records: ObjectRecord[];
    aggregatedValues: Record<string, number>;
    totalCount: number;
    pageInfo: CommonPageInfo;
  }> {
    this.validate(args);
    const authContext = toValidateAuthContext;

    if (!isWorkspaceAuthContext(authContext)) {
      throw new CommonQueryRunnerException(
        'Invalid auth context',
        CommonQueryRunnerExceptionCode.INVALID_AUTH_CONTEXT,
      );
    }

    const {
      workspaceDataSource,
      repository,
      roleId,
      shouldBypassPermissionChecks,
    } = await this.prepareQueryRunnerContext({
      authContext,
      objectMetadataItemWithFieldMaps,
    });

    const processedArgs = await this.processQueryArgs({
      authContext,
      objectMetadataItemWithFieldMaps,
      args,
    });

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const aggregateQueryBuilder = queryBuilder.clone();

    let appliedFilters = processedArgs.filter ?? ({} as ObjectRecordFilter);

    const commonQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    );

    commonQueryParser.applyFilterToBuilder(
      aggregateQueryBuilder,
      objectMetadataItemWithFieldMaps.nameSingular,
      appliedFilters,
    );

    commonQueryParser.applyDeletedAtToBuilder(
      aggregateQueryBuilder,
      appliedFilters,
    );

    const orderByWithIdCondition = [
      ...(processedArgs.orderBy ?? []),
      { id: OrderByDirection.AscNullsFirst },
    ] as ObjectRecordOrderBy;

    const isForwardPagination = !isDefined(processedArgs.before);

    const cursor = getCursor(processedArgs);

    if (cursor) {
      const cursorArgFilter = computeCursorArgFilter(
        cursor,
        orderByWithIdCondition,
        objectMetadataItemWithFieldMaps,
        isForwardPagination,
      );

      appliedFilters = (processedArgs.filter
        ? {
            and: [processedArgs.filter, { or: cursorArgFilter }],
          }
        : { or: cursorArgFilter }) as unknown as ObjectRecordFilter;
    }

    commonQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItemWithFieldMaps.nameSingular,
      appliedFilters,
    );

    commonQueryParser.applyOrderToBuilder(
      queryBuilder,
      orderByWithIdCondition,
      objectMetadataItemWithFieldMaps.nameSingular,
      isForwardPagination,
    );

    commonQueryParser.applyDeletedAtToBuilder(queryBuilder, appliedFilters);

    ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
      selectedAggregatedFields: processedArgs.selectedFieldsResult.aggregate,
      queryBuilder: aggregateQueryBuilder,
      objectMetadataNameSingular: objectMetadataItemWithFieldMaps.nameSingular,
    });

    const limit =
      processedArgs.first ?? processedArgs.last ?? QUERY_MAX_RECORDS;

    const columnsToSelect = buildColumnsToSelect({
      select: processedArgs.selectedFieldsResult.select,
      relations: processedArgs.selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    const objectRecords = (await queryBuilder
      .setFindOptions({
        select: columnsToSelect,
      })
      .take(limit + 1)
      .getMany()) as ObjectRecord[];

    const pageInfo = getPageInfo(
      objectRecords,
      orderByWithIdCondition,
      limit,
      isForwardPagination,
    );

    if (objectRecords.length > limit) {
      objectRecords.pop();
    }

    if (!isForwardPagination) {
      objectRecords.reverse();
    }

    const parentObjectRecordsAggregatedValues =
      await aggregateQueryBuilder.getRawOne();

    if (processedArgs.selectedFieldsResult.relations) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: objectRecords,
        parentObjectRecordsAggregatedValues,
        //TODO : Refacto-common - Typing to fix when switching processNestedRelationsHelper to Common
        relations: processedArgs.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        aggregate: processedArgs.selectedFieldsResult.aggregate,
        limit: QUERY_MAX_RECORDS,
        authContext,
        workspaceDataSource,
        roleId,
        shouldBypassPermissionChecks,
        selectedFields: processedArgs.selectedFieldsResult.select,
      });
    }

    const enrichedRecords = await this.enrichResultsWithGettersAndHooks({
      results: objectRecords,
      operationName: CommonQueryNames.findMany,
      authContext,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    return {
      records: enrichedRecords,
      aggregatedValues: parentObjectRecordsAggregatedValues,
      totalCount: parentObjectRecordsAggregatedValues?.totalCount,
      pageInfo,
    };
  }

  validate(args: FindManyQueryArgs) {
    if (args.first && args.last) {
      throw new CommonQueryRunnerException(
        'Cannot provide both first and last',
        CommonQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.before && args.after) {
      throw new CommonQueryRunnerException(
        'Cannot provide both before and after',
        CommonQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.before && args.first) {
      throw new CommonQueryRunnerException(
        'Cannot provide both before and first',
        CommonQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.after && args.last) {
      throw new CommonQueryRunnerException(
        'Cannot provide both after and last',
        CommonQueryRunnerExceptionCode.ARGS_CONFLICT,
      );
    }
    if (args.first !== undefined && args.first < 0) {
      throw new CommonQueryRunnerException(
        'First argument must be non-negative',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FIRST,
      );
    }
    if (args.last !== undefined && args.last < 0) {
      throw new CommonQueryRunnerException(
        'Last argument must be non-negative',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_LAST,
      );
    }
  }

  async processQueryArgs({
    authContext,
    objectMetadataItemWithFieldMaps,
    args,
  }: {
    authContext: WorkspaceAuthContext;
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    args: FindManyQueryArgs;
  }): Promise<FindManyQueryArgs> {
    const hookedArgs =
      (await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItemWithFieldMaps.nameSingular,
        CommonQueryNames.findMany,
        args,
        //TODO : Refacto-common - To fix when updating workspaceQueryHookService, removing gql typing dependency
      )) as FindManyQueryArgs;

    return {
      ...hookedArgs,
      filter: this.queryRunnerArgsFactory.overrideFilterByFieldMetadata(
        hookedArgs.filter,
        objectMetadataItemWithFieldMaps,
      ),
    };
  }
}
