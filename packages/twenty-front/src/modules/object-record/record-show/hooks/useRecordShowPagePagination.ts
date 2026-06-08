import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { lastShowPageRecordIdState } from '@/object-record/record-field/ui/states/lastShowPageRecordId';
import { buildKeysetPaginationFilter } from '@/object-record/record-show/utils/buildKeysetPaginationFilter';
import { extractOrderByFieldNames } from '@/object-record/record-show/utils/extractOrderByFieldNames';
import { reverseOrderBy } from '@/object-record/record-show/utils/reverseOrderBy';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useQueryVariablesFromParentView } from '@/views/hooks/useQueryVariablesFromParentView';
import { AppPath } from 'twenty-shared/types';
import { combineFilters, isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useRecordShowPagePagination = (
  propsObjectNameSingular: string,
  propsObjectRecordId: string,
) => {
  const {
    objectNameSingular: paramObjectNameSingular,
    objectRecordId: paramObjectRecordId,
  } = useParams();

  const navigate = useNavigateApp();
  const [searchParams] = useSearchParams();
  const viewIdQueryParam = searchParams.get('viewId');

  const setLastShowPageRecordId = useSetAtomState(lastShowPageRecordIdState);

  const objectNameSingular = propsObjectNameSingular || paramObjectNameSingular;
  const objectRecordId = propsObjectRecordId || paramObjectRecordId;

  if (!objectNameSingular || !objectRecordId) {
    throw new Error('Object name or Record id is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { filter, orderBy, isSoftDeleteFilterActive } =
    useQueryVariablesFromParentView({
      objectMetadataItem,
    });

  const orderByGqlFields = extractOrderByFieldNames(orderBy);

  const reversedOrderBy = reverseOrderBy(orderBy);

  const { loading: loadingCurrentRecord, records: currentRecords } =
    useFindManyRecords({
      filter: { id: { eq: objectRecordId } },
      orderBy,
      limit: 1,
      objectNameSingular,
      recordGqlFields: { ...orderByGqlFields, deletedAt: true },
      withSoftDeleted: true,
    });

  const currentRecord = currentRecords[0];
  const isCurrentRecordDeleted = isDefined(currentRecord?.deletedAt);
  const withSoftDeleted = isSoftDeleteFilterActive || isCurrentRecordDeleted;

  const deletedOnlyFilter = isCurrentRecordDeleted
    ? { deletedAt: { is: 'NOT_NULL' as const } }
    : undefined;

  const { beforeFilter, afterFilter } = (() => {
    if (!isDefined(currentRecord)) {
      return { beforeFilter: undefined, afterFilter: undefined };
    }

    const recordValues: Record<string, unknown> = {};

    for (const fieldName of Object.keys(orderByGqlFields)) {
      recordValues[fieldName] = currentRecord[fieldName];
    }
    recordValues['id'] = currentRecord.id;

    return {
      beforeFilter: buildKeysetPaginationFilter({
        orderBy,
        currentRecordValues: recordValues,
        direction: 'before',
      }),
      afterFilter: buildKeysetPaginationFilter({
        orderBy,
        currentRecordValues: recordValues,
        direction: 'after',
      }),
    };
  })();

  const hasKeysetFilters = isDefined(beforeFilter) && isDefined(afterFilter);
  const skipNeighborQueries = loadingCurrentRecord || !hasKeysetFilters;

  const baseNeighborOptions = {
    skip: skipNeighborQueries,
    objectNameSingular,
    recordGqlFields: { id: true },
    withSoftDeleted,
    limit: 1,
  };

  const mergedFilter = combineFilters(
    [filter, deletedOnlyFilter].filter(isDefined),
  );

  const {
    loading: loadingRecordBefore,
    records: recordsBefore,
    totalCount: totalCountBefore,
  } = useFindManyRecords({
    ...baseNeighborOptions,
    fetchPolicy: 'network-only',
    filter: combineFilters([mergedFilter, beforeFilter].filter(isDefined)),
    orderBy: reversedOrderBy,
  });

  const {
    loading: loadingRecordAfter,
    records: recordsAfter,
    totalCount: totalCountAfter,
  } = useFindManyRecords({
    ...baseNeighborOptions,
    fetchPolicy: 'network-only',
    filter: combineFilters([mergedFilter, afterFilter].filter(isDefined)),
    orderBy,
  });

  const { records: firstRecords } = useFindManyRecords({
    ...baseNeighborOptions,
    filter: mergedFilter,
    orderBy,
  });

  const { records: lastRecords } = useFindManyRecords({
    ...baseNeighborOptions,
    filter: mergedFilter,
    orderBy: reversedOrderBy,
  });

  const loading =
    loadingRecordAfter ||
    loadingRecordBefore ||
    loadingCurrentRecord ||
    !hasKeysetFilters;

  const recordBefore = recordsBefore[0];
  const recordAfter = recordsAfter[0];

  // oxlint-disable-next-line twenty/no-navigate-prefer-link -- programmatic navigation from hook callbacks, <Link> not usable here
  const navigateToRecord = (targetRecordId: string) => {
    navigate(
      AppPath.RecordShowPage,
      { objectNameSingular, objectRecordId: targetRecordId },
      { viewId: viewIdQueryParam },
    );
  };

  const navigateToPreviousRecord = () => {
    if (loading) return;

    if (isDefined(recordBefore)) {
      navigateToRecord(recordBefore.id);
    } else if (isDefined(lastRecords[0])) {
      navigateToRecord(lastRecords[0].id);
    }
  };

  const navigateToNextRecord = () => {
    if (loading) return;

    if (isDefined(recordAfter)) {
      navigateToRecord(recordAfter.id);
    } else if (isDefined(firstRecords[0])) {
      navigateToRecord(firstRecords[0].id);
    }
  };

  const navigateToIndexView = () => {
    navigate(
      AppPath.RecordIndexPage,
      { objectNamePlural: objectMetadataItem.namePlural },
      { viewId: viewIdQueryParam },
    );
    setLastShowPageRecordId(objectRecordId);
  };

  const rankInView = isDefined(totalCountBefore) ? totalCountBefore : -1;
  const totalCount =
    rankInView > -1 && isDefined(totalCountAfter)
      ? 1 + rankInView + totalCountAfter
      : 0;

  // Preserve last settled values to avoid 0/0 flash during navigation
  const [cachedPagination, setCachedPagination] = useState({
    rankInView,
    totalCount,
  });

  if (!loading && rankInView > -1) {
    if (
      cachedPagination.rankInView !== rankInView ||
      cachedPagination.totalCount !== totalCount
    ) {
      setCachedPagination({ rankInView, totalCount });
    }
  }

  return {
    isLoadingPagination: loading,
    navigateToPreviousRecord,
    navigateToNextRecord,
    navigateToIndexView,
    rankInView: loading ? cachedPagination.rankInView : rankInView,
    totalCount: loading ? cachedPagination.totalCount : totalCount,
    objectMetadataItem,
  };
};
