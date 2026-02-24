import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useStore } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import {
  ViewType as CoreViewType,
  useFindAllCoreViewsLazyQuery,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const INDEX_VIEW_TYPES = [
  CoreViewType.TABLE,
  CoreViewType.KANBAN,
  CoreViewType.CALENDAR,
];

export const ViewMetadataProviderInitialEffect = () => {
  const isLoggedIn = useIsLogged();
  const isCurrentUserLoaded = useRecoilValueV2(isCurrentUserLoadedState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const store = useStore();
  const [isInitialized, setIsInitialized] = useState(false);

  const { updateDraft, applyChanges } = useMetadataStore();

  const [findAllCoreViews] = useFindAllCoreViewsLazyQuery();

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
    if (isInitialized) {
      return;
    }
    if (!isCurrentUserLoaded) {
      return;
    }

    if (!isLoggedIn || !isWorkspaceActiveOrSuspended(currentWorkspace)) {
      setIsInitialized(true);
      return;
    }

    const loadViews = async () => {
      const result = await findAllCoreViews({
        variables: { viewTypes: INDEX_VIEW_TYPES },
        fetchPolicy: 'network-only',
      });

      if (isDefined(result.data?.getCoreViews)) {
        setIndexCoreViews(result.data.getCoreViews);
        updateDraft('views', result.data.getCoreViews);
        applyChanges();
      }

      setIsInitialized(true);
    };

    loadViews();
  }, [
    isInitialized,
    isCurrentUserLoaded,
    isLoggedIn,
    currentWorkspace,
    findAllCoreViews,
    setIndexCoreViews,
    updateDraft,
    applyChanges,
  ]);

  return null;
};
