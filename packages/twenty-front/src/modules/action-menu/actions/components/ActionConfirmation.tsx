import { type ReactNode, useCallback, useContext, useState } from 'react';
import { t } from '@lingui/core/macro';

import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useActionMenuConfirmationModal } from '@/action-menu/confirmation-modal/hooks/useActionMenuConfirmationModal';
import { useListenToActionMenuConfirmationModalResultBrowserEvent } from '@/action-menu/confirmation-modal/hooks/useListenToActionMenuConfirmationModalResultBrowserEvent';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
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

  const [pendingFrontComponentId, setPendingFrontComponentId] = useState<
    string | null
  >(null);

  const handleResult = useCallback(
    async ({ result }: { result: 'confirm' | 'cancel' }) => {
      setPendingFrontComponentId(null);

      if (result === 'confirm') {
        await onConfirmClick();
        closeActionMenu();
      }
    },
    [onConfirmClick, closeActionMenu],
  );

  useListenToActionMenuConfirmationModalResultBrowserEvent({
    onActionMenuConfirmationModalResultBrowserEvent: handleResult,
    frontComponentId: pendingFrontComponentId,
  });

  if (!actionConfig) {
    return null;
  }

  const handleClick = () => {
    setPendingFrontComponentId(actionConfig.key);

    openConfirmationModal({
      frontComponentId: actionConfig.key,
      title,
      subtitle,
      confirmButtonText,
      confirmButtonAccent,
    });
  };

  return <ActionDisplay onClick={handleClick} />;
};
