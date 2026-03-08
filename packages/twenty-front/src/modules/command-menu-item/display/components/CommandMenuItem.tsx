import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { CommandMenuItemConfigContext } from '@/command-menu-item/contexts/CommandMenuItemConfigContext';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
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

  const { closeCommandMenu } = useCloseCommandMenu({
    closeSidePanelOnShowPageOptionsActionExecution,
    closeSidePanelOnCommandMenuItemListActionExecution,
  });

  if (!actionConfig) {
    return null;
  }

  const handleClick = () => {
    closeCommandMenu();
    onClick();
  };

  return <CommandMenuItemDisplay onClick={handleClick} />;
};
