import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { ObjectRecord } from 'twenty-shared/types';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { DEFAULT_ID_ORDER_BY_TIEBREAKER } from 'src/engine/api/common/constants/default-id-order-by-tiebreaker.constant';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { computeMaxFieldCountPerRecord } from 'src/engine/api/common/common-query-runners/utils/compute-max-field-count-per-record.util';
import { getFindManyPageSize } from 'src/engine/api/common/common-query-runners/utils/get-find-many-page-size.util';
import { CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonQueryRunResult } from 'src/engine/api/common/types/common-query-result.type';
import { CommonExtendedQueryRunnerContext } from 'src/engine/api/common/types/common-extended-query-runner-context.type';
import { CommonFindManyOutput } from 'src/engine/api/common/types/common-find-many-output.type';
import { type CommonAggregatedValues } from 'src/engine/api/common/types/common-aggregated-values.type';
import {
  CommonExtendedInput,
  CommonInput,
  CommonQueryNames,
  FindManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { buildCursorPage } from 'src/engine/api/utils/build-cursor-page.util';
import { getNonToOneJoinAliases } from 'src/engine/api/common/utils/get-non-to-one-join-aliases.util';
import { getPageInfo } from 'src/engine/api/common/utils/get-page-info.util';
import { ProcessAggregateHelper } from 'src/engine/api/common/utils/process-aggregate.helper';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { buildColumnsToSelect } from 'src/engine/api/common/utils/build-columns-to-select';
import { buildOrderByColumnsToSelect } from 'src/engine/api/common/utils/build-order-by-columns-to-select';
import { getCursor } from 'src/engine/api/common/utils/cursors.util';
import { buildOrderByValuesByRecordId } from 'src/engine/api/utils/build-order-by-values-by-record-id.util';
import { computeCursorArgFilter } from 'src/engine/api/utils/compute-cursor-arg-filter.util';
import {
  buildOrderByFromLeaves,
  resolveOrderByLeaves,
} from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { type CommonQueryResultProcessingArgs } from 'src/engine/api/common/types/common-query-result-processing-args.type';

@Injectable()
export class CommonFindManyQueryRunnerService extends CommonBaseQueryRunnerService<
  FindManyQueryArgs,
  CommonFindManyOutput
> {
  protected readonly operationName = CommonQueryNames.FIND_MANY;
  protected readonly isReadOnly = true;

  async run(
    args: CommonExtendedInput<FindManyQueryArgs>,
    queryRunnerContext: CommonExtendedQueryRunnerContext,
  ): Promise<CommonQueryRunResult<CommonFindManyOutput>> {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      commonQueryParser,
    } = queryRunnerContext;

    const readRepository = this.getReadRepository(queryRunnerContext);

    const queryBuilder: WorkspaceSelectQueryBuilder =
      readRepository.createQueryBuilder(flatObjectMetadata.nameSingular);

    const aggregateQueryBuilder = queryBuilder.clone();

    const appliedFilters: Partial<ObjectRecordFilter> = args.filter ?? {};

    commonQueryParser.applyFilterToBuilder({
      queryBuilder: aggregateQueryBuilder,
      objectNameSingular: flatObjectMetadata.nameSingular,
      recordFilter: appliedFilters,
    });

    commonQueryParser.applyDeletedAtToBuilder({
      queryBuilder: aggregateQueryBuilder,
      recordFilter: appliedFilters,
    });

    // Deduplicated leaves let a caller id ordering override the tie-breaker and keep scan order and keyset conditions in sync
    const orderByLeaves = resolveOrderByLeaves({
      orderBy: [
        ...(args.orderBy ?? []),
        DEFAULT_ID_ORDER_BY_TIEBREAKER,
      ] as ObjectRecordOrderBy,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      strictValidation: true,
    });
    const orderByWithIdCondition = buildOrderByFromLeaves(orderByLeaves);

    const isForwardPagination = !isDefined(args.before);

    commonQueryParser.applyFilterToBuilder({
      queryBuilder,
      objectNameSingular: flatObjectMetadata.nameSingular,
      recordFilter: appliedFilters,
    });

    const cursor = getCursor(args);

    if (cursor) {
      const cursorArgFilter = computeCursorArgFilter({
        cursor,
        orderBy: orderByWithIdCondition,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        isForwardPagination,
      });

      if (cursorArgFilter.length > 0) {
        commonQueryParser.applyCursorFilterToBuilder({
          queryBuilder,
          objectNameSingular: flatObjectMetadata.nameSingular,
          cursorFilter: { or: cursorArgFilter },
        });
      }
    }

    const parsedOrderBy = commonQueryParser.applyOrderToBuilder({
      queryBuilder,
      orderBy: orderByWithIdCondition,
      objectNameSingular: flatObjectMetadata.nameSingular,
      isForwardPagination,
    });

    commonQueryParser.applyDeletedAtToBuilder({
      queryBuilder,
      recordFilter: appliedFilters,
    });

    ProcessAggregateHelper.addSelectedAggregatedFieldsQueriesToQueryBuilder({
      selectedAggregatedFields: args.selectedFieldsResult.aggregates,
      queryBuilder: aggregateQueryBuilder,
      objectMetadataNameSingular: flatObjectMetadata.nameSingular,
    });

    const limit = getFindManyPageSize(args);

    const columnsToSelect = {
      ...buildColumnsToSelect({
        selection: args.selectedFieldsResult,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
      // Selected even when unrequested: cursor encoding reads the sort values off the records (issue #24333)
      ...buildOrderByColumnsToSelect({
        orderBy: args.orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      }),
    };

    queryBuilder.setFindOptions({ select: columnsToSelect });

    // A row-duplicating join makes LIMIT return too few records, and take/skip would drop LIMIT from the scan
    const nonToOneJoinAliases = getNonToOneJoinAliases(queryBuilder);

    if (nonToOneJoinAliases.length > 0) {
      throw new CommonQueryRunnerException(
        `Cannot filter or order through ${nonToOneJoinAliases.join(', ')}: only to-one relations are supported`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        {
          userFriendlyMessage: msg`Filtering or ordering through this relation is not supported.`,
        },
      );
    }

    if (isDefined(args.offset)) {
      queryBuilder.offset(args.offset);
    }
    queryBuilder.limit(limit + 1);

    // setFindOptions clears addSelect, so this must come after it
    commonQueryParser.addRelationOrderColumnsToBuilder({
      queryBuilder,
      parsedOrderBy,
      objectNameSingular: flatObjectMetadata.nameSingular,
      columnsToSelect,
    });

    // Raw rows carry the ordered join columns, so cursors get relation values whatever the client selected
    const { entities: fetchedObjectRecords, raw: fetchedRawRows } =
      (await queryBuilder.getRawAndEntities()) as {
        entities: ObjectRecord[];
        raw: Record<string, unknown>[];
      };
    const orderByValuesByRecordId = buildOrderByValuesByRecordId({
      orderByLeaves,
      records: fetchedObjectRecords,
      rawRows: fetchedRawRows,
      objectNameSingular: flatObjectMetadata.nameSingular,
    });
    const { items: objectRecords, pageInfo: cursorPageInfo } = buildCursorPage({
      fetchedItems: fetchedObjectRecords,
      limit,
      direction: isForwardPagination ? 'forward' : 'backward',
      // getCursor applies cursors on truthiness, so an empty-string cursor must not advertise navigation
      hasAfterCursor: Boolean(args.after),
      hasBeforeCursor: Boolean(args.before),
    });
    const pageInfo = getPageInfo({
      records: objectRecords,
      orderBy: orderByWithIdCondition,
      pageInfo: cursorPageInfo,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      orderByValuesByRecordId,
    });
    const aggregatedValues = isEmptyObject(args.selectedFieldsResult.aggregates)
      ? undefined
      : await aggregateQueryBuilder.getRawOne<CommonAggregatedValues>();

    const relationAggregatedValues = await this.processNestedRelations({
      records: objectRecords,
      selection: args.selectedFieldsResult,
      queryRunnerContext,
    });

    return {
      result: {
        records: objectRecords,
        aggregatedValues,
        totalCount: aggregatedValues?.totalCount,
        pageInfo,
        orderByValuesByRecordId,
        selectedFieldsResult: args.selectedFieldsResult,
      },
      relationAggregatedValues,
    };
  }

  async computeArgs(
    args: CommonInput<FindManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): Promise<CommonInput<FindManyQueryArgs>> {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    return {
      ...args,
      orderBy: this.orderByArgProcessor.process({
        orderBy: args.orderBy,
      }),
      filter: this.filterArgProcessor.process({
        filter: args.filter,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    };
  }

  protected getResultRecords(results: CommonFindManyOutput): ObjectRecord[] {
    return results.records;
  }

  async processQueryResult({
    queryResult,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    workspaceId,
    selection,
  }: CommonQueryResultProcessingArgs<CommonFindManyOutput>): Promise<CommonFindManyOutput> {
    const processedRecords =
      await this.commonResultGettersService.processRecordArray({
        records: queryResult.records,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        workspaceId,
        selection,
      });

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
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
    if (args.before && args.after) {
      throw new CommonQueryRunnerException(
        'Cannot provide both before and after',
        CommonQueryRunnerExceptionCode.ARGS_CONFLICT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
    if (args.before && args.first) {
      throw new CommonQueryRunnerException(
        'Cannot provide both before and first',
        CommonQueryRunnerExceptionCode.ARGS_CONFLICT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
    if (args.after && args.last) {
      throw new CommonQueryRunnerException(
        'Cannot provide both after and last',
        CommonQueryRunnerExceptionCode.ARGS_CONFLICT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
    if (args.first !== undefined && args.first < 0) {
      throw new CommonQueryRunnerException(
        'First argument must be non-negative',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_FIRST,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
    if (args.last !== undefined && args.last < 0) {
      throw new CommonQueryRunnerException(
        'Last argument must be non-negative',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_LAST,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  protected override computeQueryComplexity(
    selectedFieldsResult: CommonSelectedFieldsResult,
    args: CommonExtendedInput<FindManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): number {
    const baseComplexity = super.computeQueryComplexity(
      selectedFieldsResult,
      args,
      queryRunnerContext,
    );

    const { flatObjectMetadata, flatFieldMetadataMaps } = queryRunnerContext;

    const orderByRelationCount = resolveOrderByLeaves({
      orderBy: args.orderBy ?? [],
      flatObjectMetadata,
      flatFieldMetadataMaps,
    }).filter((leaf) => leaf.kind === 'relation').length;

    return baseComplexity + orderByRelationCount;
  }

  protected override computeQueryComplexityV2(
    selectedFieldsResult: CommonSelectedFieldsResult,
    args: CommonExtendedInput<FindManyQueryArgs>,
    queryRunnerContext: CommonBaseQueryRunnerContext,
  ): number {
    const {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = queryRunnerContext;

    return (
      getFindManyPageSize(args) *
      computeMaxFieldCountPerRecord({
        selection: selectedFieldsResult,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        recordLimitPerOneToManyRelation: QUERY_MAX_RECORDS_FROM_RELATION,
      })
    );
  }
}
