import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import {
  FeatureFlagKey,
  useFindManyNavigationMenuItemsQuery,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { useStore } from 'jotai';

export const PrefetchRunNavigationMenuItemQueriesEffect = () => {
  const store = useStore();
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  const showAuthModal = useShowAuthModal();
  const isSettingsPage = useIsSettingsPage();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isWorkspaceActive =
    currentWorkspace?.activationStatus === WorkspaceActivationStatus.ACTIVE;

  const setPrefetchIsLoaded = useSetAtomFamilyState(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllNavigationMenuItems,
  );

  const setPrefetchNavigationMenuItems = useSetAtomState(
    prefetchNavigationMenuItemsState,
  );

  const { data, loading } = useFindManyNavigationMenuItemsQuery({
    skip:
      showAuthModal ||
      isSettingsPage ||
      !isWorkspaceActive ||
      !isNavigationMenuItemEditingEnabled,
    fetchPolicy: 'cache-and-network',
  });

  const setPrefetchNavigationMenuItemsStateIfChanged = useCallback(
    (navigationMenuItems: NavigationMenuItem[]) => {
      const existingNavigationMenuItems = store.get(
        prefetchNavigationMenuItemsState.atom,
      );
      if (!isDeeplyEqual(existingNavigationMenuItems, navigationMenuItems)) {
        setPrefetchNavigationMenuItems(navigationMenuItems);
      }
    },
    [setPrefetchNavigationMenuItems, store],
  );

  useEffect(() => {
    if (!loading && isDefined(data?.navigationMenuItems)) {
      setPrefetchNavigationMenuItemsStateIfChanged(data.navigationMenuItems);
      setPrefetchIsLoaded(true);
    }
  }, [
    data,
    loading,
    setPrefetchNavigationMenuItemsStateIfChanged,
    setPrefetchIsLoaded,
  ]);

  return <></>;
};
