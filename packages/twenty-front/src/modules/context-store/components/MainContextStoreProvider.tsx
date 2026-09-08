import { MainContextStoreProviderEffect } from '@/context-store/components/MainContextStoreProviderEffect';
import { useEnsoViewerScope } from '@/enso/viewer-scope/hooks/useEnsoViewerScope';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ViewKey, ViewType } from '~/generated-metadata/graphql';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

// The one place that decides which view an object opens on.
//
// An explicit choice in the URL wins, then wherever this person was last, then
// their ROLE's configured default, then the workspace INDEX view. The role
// default is a starting point rather than a cage: it applies until the person
// navigates somewhere themselves.
const getViewId = (
  viewIdFromQueryParams: string | null,
  indexViewId?: string,
  lastVisitedViewId?: string,
  firstAvailableViewId?: string,
  roleDefaultViewId?: string,
) => {
  if (isDefined(viewIdFromQueryParams)) {
    return viewIdFromQueryParams;
  }

  if (isDefined(lastVisitedViewId)) {
    return lastVisitedViewId;
  }

  if (isDefined(roleDefaultViewId)) {
    return roleDefaultViewId;
  }

  if (isDefined(indexViewId)) {
    return indexViewId;
  }

  if (isDefined(firstAvailableViewId)) {
    return firstAvailableViewId;
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
  const isStandalonePage = isMatchingLocation(location, AppPath.PageLayoutPage);
  const isSettingsPage = useIsSettingsPage();

  const objectNamePlural = useParams().objectNamePlural ?? '';
  const objectNameSingular = useParams().objectNameSingular ?? '';

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
  const { roleDefaultViewIdByObjectMetadataId } = useEnsoViewerScope();

  const viewIdQueryParamView = views.find(
    (view) => view.id === viewIdQueryParamRaw,
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

  // A role default pointing at a view that no longer exists, or that this
  // viewer cannot see, must not strand them — hence the lookup against `views`.
  const roleDefaultViewIdRaw = isDefined(objectMetadataItem)
    ? roleDefaultViewIdByObjectMetadataId[objectMetadataItem.id]
    : undefined;

  const roleDefaultViewId = views.find(
    (view) =>
      view.id === roleDefaultViewIdRaw && view.type !== ViewType.FIELDS_WIDGET,
  )?.id;

  const viewId = getViewId(
    viewIdQueryParam,
    indexViewId,
    lastVisitedViewId,
    firstAvailableViewId,
    roleDefaultViewId,
  );

  const shouldComputeContextStore =
    (isRecordIndexPage ||
      isRecordShowPage ||
      isStandalonePage ||
      isSettingsPage) &&
    metadataStore.status === 'up-to-date';

  if (!shouldComputeContextStore) {
    return null;
  }

  return (
    <MainContextStoreProviderEffect
      viewId={viewId}
      objectMetadataItem={objectMetadataItem}
      isRecordIndexPage={isRecordIndexPage}
      isRecordShowPage={isRecordShowPage}
      isStandalonePage={isStandalonePage}
      isSettingsPage={isSettingsPage}
    />
  );
};
