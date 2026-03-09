import { CommandMenuItemConfigContext } from '@/command-menu-item/contexts/CommandMenuItemConfigContext';
import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { useContext } from 'react';

export const CommandMenuItemExecution = ({
  onClick,
  closeSidePanelOnShowPageOptionsCommandExecution = false,
  closeSidePanelOnCommandMenuItemListCommandExecution = true,
}: {
  onClick: () => void;
  closeSidePanelOnShowPageOptionsCommandExecution?: boolean;
  closeSidePanelOnCommandMenuItemListCommandExecution?: boolean;
}) => {
  const commandMenuItemConfig = useContext(CommandMenuItemConfigContext);

  const { closeCommandMenu } = useCloseCommandMenu({
    closeSidePanelOnShowPageOptionsCommandExecution,
    closeSidePanelOnCommandMenuItemListCommandExecution,
  });

  if (!commandMenuItemConfig) {
    return null;
  }

  const handleClick = () => {
    closeCommandMenu();
    onClick();
  };

  return <CommandMenuItemDisplay onClick={handleClick} />;
};
