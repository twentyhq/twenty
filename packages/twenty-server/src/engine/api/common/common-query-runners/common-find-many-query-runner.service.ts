import { Injectable } from '@nestjs/common';

import { isDefined } from 'class-validator';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { ObjectRecord, OrderByDirection } from 'twenty-shared/types';
import { FindOptionsRelations, ObjectLiteral } from 'typeorm';

import { WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { CommonFindManyOutput } from 'src/engine/api/common/types/common-find-many-output.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  FindManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { getPageInfo } from 'src/engine/api/common/utils/get-page-info.util';
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { getCursor } from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';
import { computeCursorArgFilter } from 'src/engine/api/utils/compute-cursor-arg-filter.utils';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

@Injectable()
export class CommonFindManyQueryRunnerService extends CommonBaseQueryRunnerService<
  FindManyQueryArgs,
  CommonFindManyOutput
> {
  protected readonly operationName = CommonQueryNames.FIND_MANY;

  async run(
    args: CommonExtendedInput<FindManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonFindManyOutput> {
    const {
      repository,
      authContext,
      rolePermissionConfig,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
      workspaceDataSource,
      commonQueryParser,
    } = queryRunnerContext;

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItemWithFieldMaps.nameSingular,
    );

    const aggregateQueryBuilder = queryBuilder.clone();

    let appliedFilters = args.filter ?? ({} as ObjectRecordFilter);

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
      ...(args.orderBy ?? []),
      { id: OrderByDirection.AscNullsFirst },
    ] as ObjectRecordOrderBy;

    const isForwardPagination = !isDefined(args.before);

    const cursor = getCursor(args);

    if (cursor) {
      const cursorArgFilter = computeCursorArgFilter(
        cursor,
        orderByWithIdCondition,
        objectMetadataItemWithFieldMaps,
        isForwardPagination,
      );

      appliedFilters = (args.filter
        ? {
            and: [args.filter, { or: cursorArgFilter }],
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
      selectedAggregatedFields: args.selectedFieldsResult.aggregate,
      queryBuilder: aggregateQueryBuilder,
      objectMetadataNameSingular: objectMetadataItemWithFieldMaps.nameSingular,
    });

    const limit = args.first ?? args.last ?? QUERY_MAX_RECORDS;

    const columnsToSelect = buildColumnsToSelect({
      select: args.selectedFieldsResult.select,
      relations: args.selectedFieldsResult.relations,
      objectMetadataItemWithFieldMaps,
      objectMetadataMaps,
    });

    if (isDefined(args.offset)) {
      queryBuilder.skip(args.offset);
    }

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

    if (!isForwardPagination) {
      objectRecords.reverse();
    }

    const parentObjectRecordsAggregatedValues =
      await aggregateQueryBuilder.getRawOne();

    if (isDefined(args.selectedFieldsResult.relations)) {
      await this.processNestedRelationsHelper.processNestedRelations({
        objectMetadataMaps,
        parentObjectMetadataItem: objectMetadataItemWithFieldMaps,
        parentObjectRecords: objectRecords,
        parentObjectRecordsAggregatedValues,
        //TODO : Refacto-common - Typing to fix when switching processNestedRelationsHelper to Common
        relations: args.selectedFieldsResult.relations as Record<
          string,
          FindOptionsRelations<ObjectLiteral>
        >,
        aggregate: args.selectedFieldsResult.aggregate,
        limit: QUERY_MAX_RECORDS,
        authContext,
        workspaceDataSource,
        rolePermissionConfig,
        selectedFields: args.selectedFieldsResult.select,
      });
    }

    return {
      records: objectRecords,
      aggregatedValues: parentObjectRecordsAggregatedValues,
      totalCount: parentObjectRecordsAggregatedValues?.totalCount,
      pageInfo,
      selectedFieldsResult: args.selectedFieldsResult,
    };
  }

  async computeArgs(
    args: CommonInput<FindManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<FindManyQueryArgs>> {
    const { objectMetadataItemWithFieldMaps } = queryRunnerContext;

    return {
      ...args,
      filter: this.queryRunnerArgsFactory.overrideFilterByFieldMetadata(
        args.filter,
        objectMetadataItemWithFieldMaps,
      ),
    };
  }

  async processQueryResult(
    queryResult: CommonFindManyOutput,
    objectMetadataItemId: string,
    objectMetadataMaps: ObjectMetadataMaps,
    authContext: WorkspaceAuthContext,
  ): Promise<CommonFindManyOutput> {
    const processedRecords =
      await this.commonResultGettersService.processRecordArray(
        queryResult.records,
        objectMetadataItemId,
        objectMetadataMaps,
        authContext.workspace.id,
      );

    return {
      ...queryResult,
      records: processedRecords,
    };
  }

  async validate(
    args: CommonInput<FindManyQueryArgs>,
    _queryRunnerContext: CommonBaseQueryRunnerContext,
  ) {
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
}
