import { useStore } from 'jotai';
import { useState } from 'react';
import {
  parsePath,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { lastShowPageRecordIdState } from '@/object-record/record-field/ui/states/lastShowPageRecordId';
import { computeCursorArgFilter } from '@/object-record/graphql/utils/computeCursorArgFilter';
import { extractOrderByFieldNames } from '@/object-record/graphql/utils/extractOrderByFieldNames';
import { reverseOrderBy } from '@/object-record/graphql/utils/reverseOrderBy';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useQueryVariablesFromParentView } from '@/views/hooks/useQueryVariablesFromParentView';
import { AppPath, SidePanelPages } from 'twenty-shared/types';
import { combineFilters, getAppPath, isDefined } from 'twenty-shared/utils';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useRecordShowPagePagination = (
  propsObjectNameSingular: string,
  propsObjectRecordId: string,
) => {
  const surfaceId = useComponentStateSurfaceId();
  const {
    objectNameSingular: paramObjectNameSingular,
    objectRecordId: paramObjectRecordId,
  } = useParams();

  const store = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateSidePanelHistory } = useSidePanelHistory();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
  const workspaceSurface = useWorkspaceSurface();
  const ownsSidePanelRoute =
    workspaceSurface.type === 'side-panel' &&
    workspaceSurface.ownsRouteLocation;
  const [searchParams] = useSearchParams();
  const viewIdQueryParam = searchParams.get('viewId');

  const setLastShowPageRecordId = useSetAtomComponentState(
    lastShowPageRecordIdState,
  );

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

  const currentRecordKeysetValues: Record<string, unknown> | undefined =
    isDefined(currentRecord)
      ? {
          id: currentRecord.id,
          ...Object.fromEntries(
            Object.keys(orderByGqlFields).map((fieldName) => [
              fieldName,
              currentRecord[fieldName],
            ]),
          ),
        }
      : undefined;

  const beforeFilter = isDefined(currentRecordKeysetValues)
    ? computeCursorArgFilter({
        orderBy,
        cursorRecordValues: currentRecordKeysetValues,
        isForwardPagination: false,
      })
    : undefined;

  const afterFilter = isDefined(currentRecordKeysetValues)
    ? computeCursorArgFilter({
        orderBy,
        cursorRecordValues: currentRecordKeysetValues,
        isForwardPagination: true,
      })
    : undefined;

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

  const isAtFirstRecord = !loadingRecordBefore && totalCountBefore === 0;
  const isAtLastRecord = !loadingRecordAfter && totalCountAfter === 0;

  const { loading: loadingFirstRecord, records: firstRecords } =
    useFindManyRecords({
      ...baseNeighborOptions,
      skip: skipNeighborQueries || !isAtLastRecord,
      filter: mergedFilter,
      orderBy,
    });

  const { loading: loadingLastRecord, records: lastRecords } =
    useFindManyRecords({
      ...baseNeighborOptions,
      skip: skipNeighborQueries || !isAtFirstRecord,
      filter: mergedFilter,
      orderBy: reversedOrderBy,
    });

  const loading =
    loadingRecordAfter ||
    loadingRecordBefore ||
    loadingCurrentRecord ||
    !hasKeysetFilters ||
    (isAtLastRecord && loadingFirstRecord) ||
    (isAtFirstRecord && loadingLastRecord);

  const recordBefore = recordsBefore[0];
  const recordAfter = recordsAfter[0];

  // oxlint-disable-next-line twenty/no-navigate-prefer-link
  const navigateToRecord = (targetRecordId: string) => {
    const destinationPath = `${getAppPath(
      AppPath.RecordShowPage,
      { objectNameSingular, objectRecordId: targetRecordId },
      { viewId: viewIdQueryParam },
    )}${location.hash}`;

    navigate(
      destinationPath,
      ownsSidePanelRoute ? { replace: true } : undefined,
    );
  };

  const navigateToPreviousRecord = () => {
    if (loading) return;

    if (isDefined(recordBefore)) {
      return navigateToRecord(recordBefore.id);
    }

    if (isDefined(lastRecords[0])) {
      return navigateToRecord(lastRecords[0].id);
    }
  };

  const navigateToNextRecord = () => {
    if (loading) return;

    if (isDefined(recordAfter)) {
      return navigateToRecord(recordAfter.id);
    }

    if (isDefined(firstRecords[0])) {
      return navigateToRecord(firstRecords[0].id);
    }
  };

  const navigateToIndexView = () => {
    const indexPath = getAppPath(
      AppPath.RecordIndexPage,
      { objectNamePlural: objectMetadataItem.namePlural },
      { viewId: viewIdQueryParam },
    );

    if (ownsSidePanelRoute) {
      const indexLocation = parsePath(indexPath);
      const navigationStack = store.get(sidePanelNavigationStackState.atom);
      const previousIndexPageIndex = navigationStack.findLastIndex(
        (navigationItem) =>
          navigationItem.page === SidePanelPages.RoutedPage &&
          navigationItem.routedLocation.pathname === indexLocation.pathname &&
          (new URLSearchParams(navigationItem.routedLocation.search).get(
            'viewId',
          ) ?? '') === (viewIdQueryParam ?? ''),
      );

      if (previousIndexPageIndex >= 0) {
        const previousIndexPage = navigationStack[previousIndexPageIndex];

        store.set(
          lastShowPageRecordIdState.atomFamily({
            instanceId: previousIndexPage.pageId,
            surfaceId,
          }),
          objectRecordId,
        );
        navigateSidePanelHistory(previousIndexPageIndex);
        return;
      }

      const destinationPageInstanceId = openRoutedPageInSidePanel({
        path: indexPath,
        resetNavigationStack: false,
      });

      if (isDefined(destinationPageInstanceId)) {
        store.set(
          lastShowPageRecordIdState.atomFamily({
            instanceId: destinationPageInstanceId,
            surfaceId,
          }),
          objectRecordId,
        );
      }

      return;
    }

    navigate(indexPath);
    setLastShowPageRecordId(objectRecordId);
  };

  const rankInView = isDefined(totalCountBefore) ? totalCountBefore : -1;
  const totalCount =
    rankInView > -1 && isDefined(totalCountAfter)
      ? 1 + rankInView + totalCountAfter
      : 0;

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
