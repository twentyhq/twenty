import { CommandMenuItemDisplay } from '@/command-menu-item/actions/display/components/CommandMenuItemDisplay';
import { CommandMenuItemConfigContext } from '@/command-menu-item/contexts/CommandMenuItemConfigContext';
import { useCloseActionMenu } from '@/command-menu-item/hooks/useCloseActionMenu';
import { useContext } from 'react';

export const CommandMenuItem = ({
  onClick,
  closeSidePanelOnShowPageOptionsActionExecution = false,
  closeSidePanelOnCommandMenuItemListActionExecution = true,
}: {
  onClick: () => void;
  closeSidePanelOnShowPageOptionsActionExecution?: boolean;
  closeSidePanelOnCommandMenuItemListActionExecution?: boolean;
}) => {
  const actionConfig = useContext(CommandMenuItemConfigContext);

  const { closeActionMenu } = useCloseActionMenu({
    closeSidePanelOnShowPageOptionsActionExecution,
    closeSidePanelOnCommandMenuItemListActionExecution,
  });

  if (!actionConfig) {
    return null;
  }

  const handleClick = () => {
    closeActionMenu();
    onClick();
  };

  return <CommandMenuItemDisplay onClick={handleClick} />;
};
