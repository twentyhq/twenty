import { useMetadataStore } from '@/app/hooks/useMetadataStore';
import { metadataStoreState } from '@/app/states/metadataStoreState';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import {
  ViewType as CoreViewType,
  useFindAllCoreViewsQuery,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const INDEX_VIEW_TYPES = [
  CoreViewType.TABLE,
  CoreViewType.KANBAN,
  CoreViewType.CALENDAR,
];

export const EagerMetadataLoadEffect = () => {
  const location = useLocation();
  const isLoggedIn = useIsLogged();
  const currentUser = useRecoilValueV2(currentUserState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const store = useStore();

  const objectsEntry = useFamilyRecoilValueV2(metadataStoreState, 'objects');
  const viewsEntry = useFamilyRecoilValueV2(metadataStoreState, 'views');

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();
  const { updateDraft, applyChanges } = useMetadataStore();

  const isOnAuthPath =
    isMatchingLocation(location, AppPath.Verify) ||
    isMatchingLocation(location, AppPath.VerifyEmail);

  const { data: queryDataCoreViews } = useFindAllCoreViewsQuery({
    skip: !isLoggedIn || viewsEntry.status !== 'empty' || isOnAuthPath,
    variables: { viewTypes: INDEX_VIEW_TYPES },
  });

  const setIndexCoreViews = useCallback(
    (indexViews: CoreViewWithRelations[]) => {
      const existingCoreViews = store.get(coreViewsState.atom);
      const existingFieldsWidgetViews = existingCoreViews.filter(
        (view) => view.type === CoreViewType.FIELDS_WIDGET,
      );
      const mergedViews = [...indexViews, ...existingFieldsWidgetViews];

      if (!isDeeplyEqual(existingCoreViews, mergedViews)) {
        store.set(coreViewsState.atom, mergedViews);
      }
    },
    [store],
  );

  useEffect(() => {
    if (objectsEntry.status !== 'empty') {
      return;
    }

    if (isLoggedIn && !isDefined(currentUser)) {
      return;
    }

    const loadObjectMetadata = async () => {
      if (!isLoggedIn || !isWorkspaceActiveOrSuspended(currentWorkspace)) {
        await loadMockedObjectMetadataItems();
      } else {
        await refreshObjectMetadataItems();
      }

      const loadedItems = store.get(objectMetadataItemsState.atom);
      updateDraft('objects', loadedItems);
    };

    loadObjectMetadata();
  }, [
    currentUser,
    currentWorkspace,
    isLoggedIn,
    loadMockedObjectMetadataItems,
    objectsEntry.status,
    refreshObjectMetadataItems,
    store,
    updateDraft,
  ]);

  useEffect(() => {
    if (!isDefined(queryDataCoreViews?.getCoreViews)) {
      return;
    }

    setIndexCoreViews(queryDataCoreViews.getCoreViews);
    updateDraft('views', queryDataCoreViews.getCoreViews);
  }, [queryDataCoreViews?.getCoreViews, setIndexCoreViews, updateDraft]);

  useEffect(() => {
    if (
      objectsEntry.status === 'draft_pending' &&
      viewsEntry.status === 'draft_pending'
    ) {
      applyChanges();
    }
  }, [objectsEntry.status, viewsEntry.status, applyChanges]);

  return null;
};
