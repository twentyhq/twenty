import { CommandMenuItemContext } from '@/command-menu-item/contexts/CommandMenuItemContext';
import { CommandMenuComponentInstanceContext } from '@/command-menu-item/states/contexts/CommandMenuComponentInstanceContext';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useCloseCommandMenu = ({
  closeSidePanelOnShowPageOptionsActionExecution = false,
  closeSidePanelOnCommandMenuItemListActionExecution = true,
}: {
  closeSidePanelOnShowPageOptionsActionExecution?: boolean;
  closeSidePanelOnCommandMenuItemListActionExecution?: boolean;
} = {}) => {
  const { containerType, isInSidePanel } = useContext(CommandMenuItemContext);

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
      if (
        isDefined(closeSidePanelOnCommandMenuItemListActionExecution) &&
        !closeSidePanelOnCommandMenuItemListActionExecution
      ) {
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
      isDefined(closeSidePanelOnShowPageOptionsActionExecution) &&
      closeSidePanelOnShowPageOptionsActionExecution
    ) {
      closeSidePanelMenu();
    }
  };

  return { closeCommandMenu };
};
