import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { CommandMenuItemConfigContext } from '@/action-menu/contexts/CommandMenuItemConfigContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { useContext } from 'react';

export const Action = ({
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

  return <ActionDisplay onClick={handleClick} />;
};
