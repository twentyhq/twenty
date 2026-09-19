import { useWorkspaceRouteObjects } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { RouteContextStoreProviderEffect } from '@/context-store/components/RouteContextStoreProviderEffect';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { computeObjectViewTargetIds } from '@/views/utils/computeObjectViewTargetIds';
import { isUsableLastVisitedView } from '@/views/utils/isUsableLastVisitedView';
import { matchRoutes, useLocation, useSearchParams } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey, ViewType } from '~/generated-metadata/graphql';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const getViewId = ({
  viewIdFromQueryParams,
  indexViewId,
  lastVisitedViewId,
  firstAvailableViewId,
  firstSelectableViewId,
}: {
  viewIdFromQueryParams: string | null;
  indexViewId?: string;
  lastVisitedViewId?: string;
  firstAvailableViewId?: string;
  firstSelectableViewId?: string;
}) => {
  if (isDefined(viewIdFromQueryParams)) {
    return viewIdFromQueryParams;
  }

  if (isDefined(lastVisitedViewId)) {
    return lastVisitedViewId;
  }

  if (isDefined(firstSelectableViewId)) {
    return firstSelectableViewId;
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
  const isCoreWorkflowIndexPage = isMatchingLocation(
    location,
    AppPath.WorkflowCoreIndexPage,
  );
  const isRecordIndexPage =
    isCoreWorkflowIndexPage ||
    isMatchingLocation(location, AppPath.RecordIndexPage);
  const isCoreWorkflowShowPage = isMatchingLocation(
    location,
    AppPath.WorkflowCoreShowPage,
  );
  const isRecordShowPage =
    isCoreWorkflowShowPage ||
    isMatchingLocation(location, AppPath.RecordShowPage);
  const isStandalonePage = isMatchingLocation(location, AppPath.PageLayoutPage);
  const isAiChatPage =
    isMatchingLocation(location, AppPath.AiChat) ||
    isMatchingLocation(location, AppPath.AiChatChannel);
  const isSettingsPage = useIsSettingsPage();

  const routeParams = matchRoutes(routeObjects, location)?.at(-1)?.params;
  const objectNamePlural = routeParams?.objectNamePlural;
  const isCoreWorkflowPage = isCoreWorkflowIndexPage || isCoreWorkflowShowPage;
  const objectNameSingular = isCoreWorkflowPage
    ? CoreObjectNameSingular.Workflow
    : routeParams?.objectNameSingular;

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

  const isInitialObjectViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_INITIAL_OBJECT_VIEW_ENABLED,
  );

  const lastVisitedViewId = isUsableLastVisitedView({
    lastVisitedView,
    isInitialObjectViewEnabled,
  })
    ? lastVisitedViewIdRaw
    : undefined;

  const { firstSelectableViewId, indexViewId, firstAvailableViewId } =
    computeObjectViewTargetIds({
      views,
      objectMetadataId: objectMetadataItem?.id,
      isInitialObjectViewEnabled,
    });

  const viewId = getViewId({
    viewIdFromQueryParams: viewIdQueryParam,
    indexViewId,
    lastVisitedViewId,
    firstAvailableViewId,
    firstSelectableViewId,
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
      viewId={isCoreWorkflowPage ? undefined : viewId}
      objectMetadataItem={objectMetadataItem}
      isRecordIndexPage={isRecordIndexPage}
      isRecordShowPage={isRecordShowPage}
      isStandalonePage={isStandalonePage}
      isSettingsPage={isSettingsPage}
    />
  );
};
