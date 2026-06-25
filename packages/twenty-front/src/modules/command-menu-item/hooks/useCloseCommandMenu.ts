import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';

export const useCloseCommandMenu = ({
  closeSidePanelOnShowPageOptionsExecution = false,
  closeSidePanelOnCommandMenuListExecution = true,
}: {
  closeSidePanelOnShowPageOptionsExecution?: boolean;
  closeSidePanelOnCommandMenuListExecution?: boolean;
} = {}) => {
  const { containerType, commandMenuContextApi } =
    useContext(CommandMenuContext);
  const isInSidePanel = commandMenuContextApi.isInSidePanel;

  const { closeSidePanelMenu } = useSidePanelMenu();

  const { closeDropdown } = useCloseDropdown();

  const commandMenuId = useAvailableComponentInstanceIdOrThrow(
    CommandMenuComponentInstanceContext,
  );

  const dropdownId = isInSidePanel
    ? getSidePanelCommandMenuDropdownIdFromCommandMenuId(commandMenuId)
    : getCommandMenuDropdownIdFromCommandMenuId(commandMenuId);

  const closeCommandMenu = () => {
    if (containerType === 'command-menu-list') {
      if (!closeSidePanelOnCommandMenuListExecution) {
        return;
      }
      closeSidePanelMenu();
    }

    if (
      containerType === 'index-page-dropdown' ||
      containerType === 'command-menu-show-page-dropdown'
    ) {
      closeDropdown(dropdownId);
    }

    if (
      containerType === 'command-menu-show-page-dropdown' &&
      closeSidePanelOnShowPageOptionsExecution
    ) {
      closeSidePanelMenu();
    }
  };

  return { closeCommandMenu };
};
