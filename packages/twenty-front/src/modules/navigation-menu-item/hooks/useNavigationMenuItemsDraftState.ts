import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { isLayoutCustomizationModeEnabledState } from '@/app/states/isLayoutCustomizationModeEnabledState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useNavigationMenuItemsDraftState = () => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsState);
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftState,
  );

  const workspaceNavigationMenuItemsFromState =
    filterWorkspaceNavigationMenuItems(navigationMenuItems);

  const workspaceNavigationMenuItems =
    isLayoutCustomizationModeEnabled && isDefined(navigationMenuItemsDraft)
      ? navigationMenuItemsDraft
      : workspaceNavigationMenuItemsFromState;

  const isDirty =
    isLayoutCustomizationModeEnabled &&
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
