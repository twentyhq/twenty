import { useWorkspaceRouteObjects } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { RouteContextStoreProviderEffect } from '@/context-store/components/RouteContextStoreProviderEffect';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { matchRoutes, useLocation, useSearchParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  ViewKey,
  ViewType,
} from '~/generated-metadata/graphql';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const getViewId = ({
  viewIdFromQueryParams,
  indexViewId,
  lastVisitedViewId,
  firstAvailableViewId,
  seededDefaultViewId,
}: {
  viewIdFromQueryParams: string | null;
  indexViewId?: string;
  lastVisitedViewId?: string;
  firstAvailableViewId?: string;
  seededDefaultViewId?: string;
}) => {
  if (isDefined(viewIdFromQueryParams)) {
    return viewIdFromQueryParams;
  }

  if (isDefined(lastVisitedViewId)) {
    return lastVisitedViewId;
  }

  if (isDefined(seededDefaultViewId)) {
    return seededDefaultViewId;
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
  const routeObjects = useWorkspaceRouteObjects();
  const isRecordIndexPage = isMatchingLocation(
    location,
    AppPath.RecordIndexPage,
  );
  const isRecordShowPage = isMatchingLocation(location, AppPath.RecordShowPage);
  const isStandalonePage = isMatchingLocation(location, AppPath.PageLayoutPage);
  const isAiChatPage = isMatchingLocation(location, AppPath.AiChat);
  const isSettingsPage = useIsSettingsPage();

  const routeParams = matchRoutes(routeObjects, location)?.at(-1)?.params;
  const objectNamePlural = routeParams?.objectNamePlural;
  const objectNameSingular = routeParams?.objectNameSingular;

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

  const isSeededDefaultViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SEEDED_DEFAULT_VIEW_ENABLED,
  );

  const lastVisitedViewId =
    isDefined(lastVisitedView) &&
    lastVisitedView.type !== ViewType.FIELDS_WIDGET &&
    !(isSeededDefaultViewEnabled && lastVisitedView.key === ViewKey.INDEX)
      ? lastVisitedViewIdRaw
      : undefined;

  const seededDefaultViewId = isSeededDefaultViewEnabled
    ? views.find(
        (view) =>
          view.objectMetadataId === objectMetadataItem?.id &&
          view.type !== ViewType.FIELDS_WIDGET &&
          view.key !== ViewKey.INDEX,
      )?.id
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

  const viewId = getViewId({
    viewIdFromQueryParams: viewIdQueryParam,
    indexViewId,
    lastVisitedViewId,
    firstAvailableViewId,
    seededDefaultViewId,
  });

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
