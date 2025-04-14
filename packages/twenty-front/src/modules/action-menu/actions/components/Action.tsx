import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { useContext } from 'react';

export const Action = ({
  onClick,
  preventCommandMenuClosing,
}: {
  onClick: () => void;
  preventCommandMenuClosing?: boolean;
}) => {
  const actionConfig = useContext(ActionConfigContext);

  const { closeActionMenu } = useCloseActionMenu(preventCommandMenuClosing);

  if (!actionConfig) {
    return null;
  }

  const handleClick = () => {
    closeActionMenu();
    onClick();
  };

  return <ActionDisplay onClick={handleClick} />;
};
