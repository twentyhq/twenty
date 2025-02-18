import { MainContextStoreProviderEffect } from '@/context-store/components/MainContextStoreProviderEffect';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { prefetchIndexViewIdFromObjectMetadataItemFamilySelector } from '@/prefetch/states/selector/prefetchIndexViewIdFromObjectMetadataItemFamilySelector';
import { AppPath } from '@/types/AppPath';
import { useParams, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

const getViewId = (
  viewIdFromQueryParams: string | null,
  indexViewId?: string,
  lastVisitedViewId?: string,
) => {
  if (isDefined(viewIdFromQueryParams)) {
    return viewIdFromQueryParams;
  }

  if (isDefined(lastVisitedViewId)) {
    return lastVisitedViewId;
  }

  if (isDefined(indexViewId)) {
    return indexViewId;
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
  const objectNameSingular = useParams().objectNameSingular ?? '';

  const [searchParams] = useSearchParams();
  const viewIdQueryParam = searchParams.get('viewId');

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.namePlural === objectNamePlural ||
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  const { getLastVisitedViewIdFromObjectNamePlural } = useLastVisitedView();

  const lastVisitedViewId = getLastVisitedViewIdFromObjectNamePlural(
    objectMetadataItem?.namePlural ?? '',
  );

  const indexViewId = useRecoilValue(
    prefetchIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem?.id,
    }),
  );

  const viewId = getViewId(viewIdQueryParam, indexViewId, lastVisitedViewId);

  if (!isDefined(pageName) || !isDefined(objectMetadataItem)) {
    return null;
  }

  return (
    <MainContextStoreProviderEffect
      mainContextStoreComponentInstanceIdToSet={'main-context-store'}
      viewId={viewId}
      objectMetadataItem={objectMetadataItem}
      pageName={pageName}
    />
  );
};
