import { type ReactNode, useContext } from 'react';
import { t } from '@lingui/core/macro';

import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useActionMenuConfirmationModal } from '@/action-menu/confirmation-modal/hooks/useActionMenuConfirmationModal';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { type ButtonAccent } from 'twenty-ui/input';

type ActionConfirmationProps = {
  title: string;
  subtitle: ReactNode;
  onConfirmClick: () => void | Promise<void>;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
  closeSidePanelOnShowPageOptionsActionExecution?: boolean;
  closeSidePanelOnCommandMenuListActionExecution?: boolean;
};

export const ActionConfirmation = ({
  title,
  subtitle,
  onConfirmClick,
  confirmButtonText = t`Confirm`,
  confirmButtonAccent = 'danger',
  closeSidePanelOnShowPageOptionsActionExecution,
  closeSidePanelOnCommandMenuListActionExecution,
}: ActionConfirmationProps) => {
  const actionConfig = useContext(ActionConfigContext);
  const { openConfirmationModal } = useActionMenuConfirmationModal();
  const { closeActionMenu } = useCloseActionMenu({
    closeSidePanelOnShowPageOptionsActionExecution,
    closeSidePanelOnCommandMenuListActionExecution,
  });

  if (!actionConfig) {
    return null;
  }

  const handleClick = () => {
    openConfirmationModal({
      title,
      subtitle,
      onConfirmClick: async () => {
        await onConfirmClick();
        closeActionMenu();
      },
      confirmButtonText,
      confirmButtonAccent,
    });
  };

  return <ActionDisplay onClick={handleClick} />;
};
