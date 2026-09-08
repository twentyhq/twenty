import { RouteContextStoreProviderEffect } from '@/context-store/components/RouteContextStoreProviderEffect';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useLocation, useMatch, useSearchParams } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { ViewKey, ViewType } from '~/generated-metadata/graphql';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const getViewId = (
  viewIdFromQueryParams: string | null,
  indexViewId?: string,
  lastVisitedViewId?: string,
  firstAvailableViewId?: string,
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

  if (isDefined(firstAvailableViewId)) {
    return firstAvailableViewId;
  }

  return undefined;
};

export const RouteContextStoreProvider = () => {
  const location = useLocation();
  const recordIndexPageMatch = useMatch(AppPath.RecordIndexPage);
  const recordShowPageMatch = useMatch(AppPath.RecordShowPage);
  const settingsObjectPageMatch = useMatch({
    path: getSettingsPath(SettingsPath.ObjectDetail),
    end: false,
  });
  const isRecordIndexPage = isDefined(recordIndexPageMatch);
  const isRecordShowPage = isDefined(recordShowPageMatch);
  const isStandalonePage = isMatchingLocation(location, AppPath.PageLayoutPage);
  const isAiChatPage = isMatchingLocation(location, AppPath.AiChat);
  const isSettingsPage = useIsSettingsPage();

  const objectNamePlural =
    recordIndexPageMatch?.params.objectNamePlural ??
    settingsObjectPageMatch?.params.objectNamePlural;
  const objectNameSingular = recordShowPageMatch?.params.objectNameSingular;

  const [searchParams] = useSearchParams();
  const viewIdQueryParamRaw = searchParams.get('viewId');

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const metadataStore = useAtomFamilyStateValue(metadataStoreState, 'views');
  const views = useAtomStateValue(viewsSelector);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.namePlural === objectNamePlural ||
      objectMetadataItem.nameSingular === objectNameSingular,
  );

  const { getLastVisitedViewIdFromObjectNamePlural } = useLastVisitedView();

  const viewIdQueryParamView = views.find(
    (view) =>
      view.id === viewIdQueryParamRaw &&
      view.objectMetadataId === objectMetadataItem?.id,
  );

  const viewIdQueryParam =
    isDefined(viewIdQueryParamView) &&
    viewIdQueryParamView.type !== ViewType.FIELDS_WIDGET
      ? viewIdQueryParamRaw
      : null;

  const lastVisitedViewIdRaw = getLastVisitedViewIdFromObjectNamePlural(
    objectMetadataItem?.namePlural ?? '',
  );

  const lastVisitedView = views.find(
    (view) => view.id === lastVisitedViewIdRaw,
  );

  const lastVisitedViewId =
    isDefined(lastVisitedView) &&
    lastVisitedView.type !== ViewType.FIELDS_WIDGET
      ? lastVisitedViewIdRaw
      : undefined;

  const indexViewId = views.find(
    (view) =>
      view.objectMetadataId === objectMetadataItem?.id &&
      view.key === ViewKey.INDEX,
  )?.id;

  const firstAvailableViewId = views.find(
    (view) =>
      view.objectMetadataId === objectMetadataItem?.id &&
      view.type !== ViewType.FIELDS_WIDGET,
  )?.id;

  const viewId = getViewId(
    viewIdQueryParam,
    indexViewId,
    lastVisitedViewId,
    firstAvailableViewId,
  );

  const shouldComputeContextStore =
    (isRecordIndexPage ||
      isRecordShowPage ||
      isStandalonePage ||
      isAiChatPage ||
      isSettingsPage) &&
    metadataStore.status === 'up-to-date';

  if (!shouldComputeContextStore) {
    return null;
  }

  return (
    <RouteContextStoreProviderEffect
      viewId={viewId}
      objectMetadataItem={objectMetadataItem}
      isRecordIndexPage={isRecordIndexPage}
      isRecordShowPage={isRecordShowPage}
      isStandalonePage={isStandalonePage}
      isSettingsPage={isSettingsPage}
    />
  );
};
