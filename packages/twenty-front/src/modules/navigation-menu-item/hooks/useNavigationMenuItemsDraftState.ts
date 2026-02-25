import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { isNavigationMenuInEditModeStateV2 } from '@/navigation-menu-item/states/isNavigationMenuInEditModeStateV2';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { navigationMenuItemsDraftStateV2 } from '@/navigation-menu-item/states/navigationMenuItemsDraftStateV2';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNavigationMenuItemsDraftState = () => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeStateV2,
  );
  const prefetchNavigationMenuItems = useAtomStateValue(
    prefetchNavigationMenuItemsState,
  );
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftStateV2,
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
