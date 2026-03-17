import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/common/states/isNavigationMenuInEditModeState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNavigationMenuItemsDraftState = () => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftState,
  );

  const workspaceNavigationMenuItemsFromState =
    filterWorkspaceNavigationMenuItems(navigationMenuItems);

  const workspaceNavigationMenuItems =
    isNavigationMenuInEditMode && isDefined(navigationMenuItemsDraft)
      ? navigationMenuItemsDraft
      : workspaceNavigationMenuItemsFromState;

  const isDirty =
    isNavigationMenuInEditMode &&
    isDefined(navigationMenuItemsDraft) &&
    !isDeeplyEqual(
      navigationMenuItemsDraft,
      workspaceNavigationMenuItemsFromState,
    );

  return {
    workspaceNavigationMenuItems,
    isDirty,
  };
};
