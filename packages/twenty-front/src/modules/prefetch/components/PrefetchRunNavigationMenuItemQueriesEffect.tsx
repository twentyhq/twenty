import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import {
  FeatureFlagKey,
  useFindManyNavigationMenuItemsQuery,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const PrefetchRunNavigationMenuItemQueriesEffect = () => {
  const isNavigationMenuItemEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_ENABLED,
  );

  const showAuthModal = useShowAuthModal();
  const isSettingsPage = useIsSettingsPage();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isWorkspaceActive =
    currentWorkspace?.activationStatus === WorkspaceActivationStatus.ACTIVE;

  const setIsPrefetchNavigationMenuItemsLoaded = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllNavigationMenuItems),
  );

  const { data, loading } = useFindManyNavigationMenuItemsQuery({
    skip:
      showAuthModal ||
      isSettingsPage ||
      !isWorkspaceActive ||
      !isNavigationMenuItemEnabled,
    fetchPolicy: 'cache-and-network',
  });

  const setPrefetchNavigationMenuItemsState = useRecoilCallback(
    ({ set, snapshot }) =>
      (navigationMenuItems: NavigationMenuItem[]) => {
        const existingNavigationMenuItems = snapshot
          .getLoadable(prefetchNavigationMenuItemsState)
          .getValue();

        if (!isDeeplyEqual(existingNavigationMenuItems, navigationMenuItems)) {
          set(prefetchNavigationMenuItemsState, navigationMenuItems);
        }
      },
    [],
  );

  useEffect(() => {
    if (!loading && isDefined(data?.navigationMenuItems)) {
      setPrefetchNavigationMenuItemsState(data.navigationMenuItems);
      setIsPrefetchNavigationMenuItemsLoaded(true);
    }
  }, [
    data,
    loading,
    setPrefetchNavigationMenuItemsState,
    setIsPrefetchNavigationMenuItemsLoaded,
  ]);

  return <></>;
};
