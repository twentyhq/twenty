import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getSidePanelActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getSidePanelActionMenuDropdownIdFromActionMenuId';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useCloseActionMenu = ({
  closeSidePanelOnShowPageOptionsActionExecution = false,
  closeSidePanelOnCommandMenuListActionExecution = true,
}: {
  closeSidePanelOnShowPageOptionsActionExecution?: boolean;
  closeSidePanelOnCommandMenuListActionExecution?: boolean;
} = {}) => {
  const { actionMenuType, isInSidePanel } = useContext(ActionMenuContext);

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { closeDropdown } = useCloseDropdown();

  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );

  const dropdownId = isInSidePanel
    ? getSidePanelActionMenuDropdownIdFromActionMenuId(actionMenuId)
    : getActionMenuDropdownIdFromActionMenuId(actionMenuId);

  const closeActionMenu = () => {
    if (actionMenuType === 'command-menu') {
      if (
        isDefined(closeSidePanelOnCommandMenuListActionExecution) &&
        !closeSidePanelOnCommandMenuListActionExecution
      ) {
        return;
      }
      closeSidePanelMenu();
    }

    if (
      actionMenuType === 'index-page-action-menu-dropdown' ||
      actionMenuType === 'command-menu-show-page-action-menu-dropdown'
    ) {
      closeDropdown(dropdownId);
    }

    if (
      actionMenuType === 'command-menu-show-page-action-menu-dropdown' &&
      isDefined(closeSidePanelOnShowPageOptionsActionExecution) &&
      closeSidePanelOnShowPageOptionsActionExecution
    ) {
      closeSidePanelMenu();
    }
  };

  return { closeActionMenu };
};
