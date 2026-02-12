import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';

export const useNavigationMenuItemsDraftState = () => {
  const isNavigationMenuInEditMode = useRecoilValue(
    isNavigationMenuInEditModeState,
  );
  const prefetchNavigationMenuItems = useRecoilValue(
    prefetchNavigationMenuItemsState,
  );
  const navigationMenuItemsDraft = useRecoilValue(
    navigationMenuItemsDraftState,
  );

  const workspaceNavigationMenuItemsFromPrefetch =
    filterWorkspaceNavigationMenuItems(prefetchNavigationMenuItems);

  const workspaceNavigationMenuItems =
    isNavigationMenuInEditMode && isDefined(navigationMenuItemsDraft)
      ? navigationMenuItemsDraft
      : workspaceNavigationMenuItemsFromPrefetch;

  const isDirty =
    isNavigationMenuInEditMode &&
    isDefined(navigationMenuItemsDraft) &&
    !isDeeplyEqual(
      navigationMenuItemsDraft,
      workspaceNavigationMenuItemsFromPrefetch,
    );

  return {
    workspaceNavigationMenuItems,
    isDirty,
  };
};
