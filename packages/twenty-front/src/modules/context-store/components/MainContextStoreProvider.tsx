import { MainContextStoreProviderEffect } from '@/context-store/components/MainContextStoreProviderEffect';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

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
  const location = useLocation();
  const isRecordIndexPage = isMatchingLocation(
    location,
    AppPath.RecordIndexPage,
  );
  const isRecordShowPage = isMatchingLocation(location, AppPath.RecordShowPage);
  const isSettingsPage = useIsSettingsPage();

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
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem?.id ?? '',
    }),
  );

  const viewId = getViewId(viewIdQueryParam, indexViewId, lastVisitedViewId);
  const showAuthModal = useShowAuthModal();

  const shouldComputeContextStore =
    (isRecordIndexPage || isRecordShowPage || isSettingsPage) && !showAuthModal;

  if (!shouldComputeContextStore) {
    return null;
  }

  return (
    <MainContextStoreProviderEffect
      viewId={viewId}
      objectMetadataItem={objectMetadataItem}
      isRecordIndexPage={isRecordIndexPage}
      isRecordShowPage={isRecordShowPage}
      isSettingsPage={isSettingsPage}
    />
  );
};
