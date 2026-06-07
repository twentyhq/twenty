import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { lastShowPageRecordIdState } from '@/object-record/record-field/ui/states/lastShowPageRecordId';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useRecordIdsFromFindManyCacheRootQuery } from '@/object-record/record-show/hooks/useRecordIdsFromFindManyCacheRootQuery';
import { useQueryVariablesFromParentView } from '@/views/hooks/useQueryVariablesFromParentView';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRecordFilterAboutSoftDelete } from '@/object-record/record-filter/utils/isRecordFilterAboutSoftDelete';

export const useRecordShowPagePagination = (
  propsObjectNameSingular: string,
  propsObjectRecordId: string,
) => {
  const { t } = useLingui();
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

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();

  const contextStoreRecordShowParentView = useAtomComponentStateValue(
    contextStoreRecordShowParentViewComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const parentViewComponentId =
    contextStoreRecordShowParentView?.parentViewComponentId;

  const isSoftDeleteFilterActive =
    contextStoreRecordShowParentView?.parentViewFilters.some((recordFilter) =>
      isRecordFilterAboutSoftDelete({
        recordFilter,
        objectMetadataItems,
      }),
    ) ?? false;

  const recordIdsFromParentViewIndex = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
    parentViewComponentId ?? '',
  );

  const { filter, orderBy } = useQueryVariablesFromParentView({
    objectMetadataItem,
  });

  const { loading: loadingCursor, pageInfo: currentRecordsPageInfo } =
    useFindManyRecords({
      filter: {
        id: { eq: objectRecordId },
      },
      orderBy,
      limit: 1,
      objectNameSingular,
      recordGqlFields: { id: true },
      withSoftDeleted: isSoftDeleteFilterActive,
    });

  const currentRecordCursorFromRequest = currentRecordsPageInfo?.endCursor;

  const [totalCountBefore, setTotalCountBefore] = useState<number>(0);
  const [totalCountAfter, setTotalCountAfter] = useState<number>(0);

  const { loading: loadingRecordBefore, records: recordsBefore } =
    useFindManyRecords({
      skip: loadingCursor,
      fetchPolicy: 'network-only',
      filter: {
        ...filter,
        id: { neq: objectRecordId },
      },
      orderBy,
      limit: isNonEmptyString(currentRecordCursorFromRequest) ? 1 : undefined,
      cursorFilter: isNonEmptyString(currentRecordCursorFromRequest)
        ? {
            cursorDirection: 'before',
            cursor: currentRecordCursorFromRequest,
          }
        : undefined,
      objectNameSingular,
      recordGqlFields: { id: true },
      withSoftDeleted: isSoftDeleteFilterActive,
      onCompleted: (_, pagination) => {
        setTotalCountBefore(pagination?.totalCount ?? 0);
      },
    });

  const { loading: loadingRecordAfter, records: recordsAfter } =
    useFindManyRecords({
      skip: loadingCursor,
      filter: {
        ...filter,
        id: { neq: objectRecordId },
      },
      fetchPolicy: 'network-only',
      orderBy,
      limit: isNonEmptyString(currentRecordCursorFromRequest) ? 1 : undefined,
      cursorFilter: currentRecordCursorFromRequest
        ? {
            cursorDirection: 'after',
            cursor: currentRecordCursorFromRequest,
          }
        : undefined,
      objectNameSingular,
      recordGqlFields: { id: true },
      withSoftDeleted: isSoftDeleteFilterActive,
      onCompleted: (_, pagination) => {
        setTotalCountAfter(pagination?.totalCount ?? 0);
      },
    });

  const loading = loadingRecordAfter || loadingRecordBefore || loadingCursor;

  const recordBefore = recordsBefore[0];
  const recordAfter = recordsAfter[0];

  const isFirstRecord = !loading && !isDefined(recordBefore);
  const isLastRecord = !loading && !isDefined(recordAfter);

  const { recordIdsInCache } = useRecordIdsFromFindManyCacheRootQuery({
    objectNamePlural: objectMetadataItem.namePlural,
    fieldVariables: {
      filter,
      orderBy,
    },
  });

  const cacheIsAvailableForNavigation =
    !loading &&
    (totalCountAfter > 0 || totalCountBefore > 0) &&
    recordIdsInCache.length > 0;

  const canNavigateToPreviousRecord =
    !isFirstRecord || (isFirstRecord && cacheIsAvailableForNavigation);

  const navigateToPreviousRecord = () => {
    if (loading) {
      return;
    }

    if (isFirstRecord) {
      if (cacheIsAvailableForNavigation) {
        const lastRecordIdFromCache =
          recordIdsInCache[recordIdsInCache.length - 1];

        navigate(
          AppPath.RecordShowPage,
          {
            objectNameSingular,
            objectRecordId: lastRecordIdFromCache,
          },
          {
            viewId: viewIdQueryParam,
          },
        );
      }
    } else {
      navigate(
        AppPath.RecordShowPage,
        {
          objectNameSingular,
          objectRecordId: recordBefore.id,
        },
        {
          viewId: viewIdQueryParam,
        },
      );
    }
  };

  const canNavigateToNextRecord =
    !isLastRecord || (isLastRecord && cacheIsAvailableForNavigation);

  const navigateToNextRecord = () => {
    if (loading) {
      return;
    }

    if (isLastRecord) {
      if (cacheIsAvailableForNavigation) {
        const firstRecordIdFromCache = recordIdsInCache[0];

        navigate(
          AppPath.RecordShowPage,
          {
            objectNameSingular,
            objectRecordId: firstRecordIdFromCache,
          },
          {
            viewId: viewIdQueryParam,
          },
        );
      }
    } else {
      navigate(
        AppPath.RecordShowPage,
        {
          objectNameSingular,
          objectRecordId: recordAfter.id,
        },
        {
          viewId: viewIdQueryParam,
        },
      );
    }
  };

  const navigateToIndexView = () => {
    navigate(
      AppPath.RecordIndexPage,
      {
        objectNamePlural: objectMetadataItem.namePlural,
      },
      {
        viewId: viewIdQueryParam,
      },
    );

    setLastShowPageRecordId(objectRecordId);
  };

  const rankInViewFromCache = recordIdsInCache.findIndex(
    (id) => id === objectRecordId,
  );

  const rankInViewFromParentViewIndex =
    isSoftDeleteFilterActive && isDefined(parentViewComponentId)
      ? recordIdsFromParentViewIndex.findIndex((id) => id === objectRecordId)
      : -1;

  const rankInView =
    rankInViewFromParentViewIndex > -1
      ? rankInViewFromParentViewIndex
      : rankInViewFromCache;

  const rankFoundInView = rankInView > -1;

  const objectLabelPlural = objectMetadataItem.labelPlural;

  const totalCount = 1 + Math.max(totalCountBefore, totalCountAfter);

  const currentRank = rankInView + 1;
  const viewNameWithCount = rankFoundInView
    ? t`${currentRank} of ${totalCount} in ${objectLabelPlural}`
    : t`${objectLabelPlural} (${totalCount})`;

  return {
    viewName: viewNameWithCount,
    isLoadingPagination: loading,
    navigateToPreviousRecord,
    navigateToNextRecord,
    navigateToIndexView,
    canNavigateToNextRecord,
    canNavigateToPreviousRecord,
    rankInView,
    totalCount,
    objectMetadataItem,
  };
};
