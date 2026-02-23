import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetFamilyRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetFamilyRecoilStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
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

export const PrefetchRunNavigationMenuItemQueriesEffect = () => {
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  const showAuthModal = useShowAuthModal();
  const isSettingsPage = useIsSettingsPage();
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const isWorkspaceActive =
    currentWorkspace?.activationStatus === WorkspaceActivationStatus.ACTIVE;

  const setIsPrefetchNavigationMenuItemsLoaded = useSetFamilyRecoilStateV2(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllNavigationMenuItems,
  );

  const setNavigationMenuItemsState = useSetRecoilStateV2(
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
      const existingNavigationMenuItems = jotaiStore.get(
        prefetchNavigationMenuItemsState.atom,
      );
      if (!isDeeplyEqual(existingNavigationMenuItems, navigationMenuItems)) {
        setNavigationMenuItemsState(navigationMenuItems);
      }
    },
    [setNavigationMenuItemsState],
  );

  useEffect(() => {
    if (!loading && isDefined(data?.navigationMenuItems)) {
      setPrefetchNavigationMenuItemsStateIfChanged(data.navigationMenuItems);
      setIsPrefetchNavigationMenuItemsLoaded(true);
    }
  }, [
    data,
    loading,
    setPrefetchNavigationMenuItemsStateIfChanged,
    setIsPrefetchNavigationMenuItemsLoaded,
  ]);

  return <></>;
};
