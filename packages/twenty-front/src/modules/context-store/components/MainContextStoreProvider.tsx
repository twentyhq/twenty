import { MainContextStoreProviderEffect } from '@/context-store/components/MainContextStoreProviderEffect';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { AppPath } from '@/types/AppPath';
import { View } from '@/views/types/View';
import { isNonEmptyString } from '@sniptt/guards';
import { useParams, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { undefined } from 'zod';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

const getViewId = (
  viewIdFromQueryParams: string | null,
  indexView?: View,
  lastVisitedViewId?: string,
) => {
  if (isDefined(viewIdFromQueryParams)) {
    return viewIdFromQueryParams;
  }

  if (isDefined(lastVisitedViewId)) {
    return lastVisitedViewId;
  }

  if (isDefined(indexView)) {
    return indexView.id;
  }

  return undefined;
};

export const MainContextStoreProvider = () => {
  const { isMatchingLocation } = useIsMatchingLocation();
  const isRecordIndexPage = isMatchingLocation(AppPath.RecordIndexPage);
  const isRecordShowPage = isMatchingLocation(AppPath.RecordShowPage);

  const pageName = isRecordIndexPage
    ? 'record-index'
    : isRecordShowPage
      ? 'record-show'
      : undefined;

  const objectNamePlural = useParams().objectNamePlural ?? '';

  const [searchParams] = useSearchParams();
  const viewIdQueryParam = searchParams.get('viewId');

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.namePlural === objectNamePlural,
  );

  const { getLastVisitedViewIdFromObjectNamePlural } = useLastVisitedView();

  const lastVisitedViewId = getLastVisitedViewIdFromObjectNamePlural(
    objectMetadataItem?.namePlural ?? '',
  );

  const viewsOnCurrentObject = views.filter(
    (view) => view.objectMetadataId === objectMetadataItem?.id,
  );
  const indexView = viewsOnCurrentObject.find((view) => view.key === 'INDEX');

  const viewId = getViewId(viewIdQueryParam, indexView, lastVisitedViewId);

  const mainContextStoreComponentInstanceId = `${pageName}-${objectMetadataItem?.namePlural}-${viewId}`;

  if (
    !isDefined(pageName) ||
    !isDefined(objectMetadataItem) ||
    !isNonEmptyString(viewId)
  ) {
    return null;
  }

  return (
    <MainContextStoreProviderEffect
      mainContextStoreComponentInstanceIdToSet={
        mainContextStoreComponentInstanceId
      }
      viewId={viewId}
      objectMetadataItem={objectMetadataItem}
    />
  );
};
