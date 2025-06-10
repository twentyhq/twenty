import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getRightDrawerActionMenuDropdownIdFromActionMenuId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useCloseActionMenu = (preventCommandMenuClosing?: boolean) => {
  const { actionMenuType, isInRightDrawer } = useContext(ActionMenuContext);

  const { closeCommandMenu } = useCommandMenu();

  const { closeDropdown } = useDropdownV2();

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const dropdownId = isInRightDrawer
    ? getRightDrawerActionMenuDropdownIdFromActionMenuId(actionMenuId)
    : getActionMenuDropdownIdFromActionMenuId(actionMenuId);

  const closeActionMenu = () => {
    if (actionMenuType === 'command-menu') {
      if (isDefined(preventCommandMenuClosing) && preventCommandMenuClosing) {
        return;
      }
      closeCommandMenu();
    }

    if (
      actionMenuType === 'index-page-action-menu-dropdown' ||
      actionMenuType === 'command-menu-show-page-action-menu-dropdown'
    ) {
      closeDropdown(dropdownId);
    }
  };

  return { closeActionMenu };
};
