import { type ReactNode, useContext } from 'react';
import { t } from '@lingui/core/macro';

import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useActionMenuConfirmationModal } from '@/action-menu/confirmation-modal/hooks/useActionMenuConfirmationModal';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type ButtonAccent } from 'twenty-ui/input';

type ActionConfirmationModalProps = {
  title: string;
  subtitle: ReactNode;
  onConfirmClick: () => void | Promise<void>;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
  closeSidePanelOnShowPageOptionsActionExecution?: boolean;
  closeSidePanelOnCommandMenuListActionExecution?: boolean;
};

export const ActionConfirmationModal = ({
  title,
  subtitle,
  onConfirmClick,
  confirmButtonText = t`Confirm`,
  confirmButtonAccent = 'danger',
  closeSidePanelOnShowPageOptionsActionExecution,
  closeSidePanelOnCommandMenuListActionExecution,
}: ActionConfirmationModalProps) => {
  const actionConfig = useContext(ActionConfigContext);
  const actionMenuContext = useContext(ActionMenuContext);
  const actionMenuComponentInstanceId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );
  const { openConfirmationModalAndWaitForResult } =
    useActionMenuConfirmationModal();
  const { closeActionMenu } = useCloseActionMenu({
    closeSidePanelOnShowPageOptionsActionExecution,
    closeSidePanelOnCommandMenuListActionExecution,
  });
  const legacyCommandActionMenuId = actionConfig
    ? `${actionMenuComponentInstanceId}:${actionMenuContext.actionMenuType}:${actionMenuContext.displayType}:${actionConfig.key}`
    : null;

  if (!actionConfig || legacyCommandActionMenuId === null) {
    return null;
  }

  const handleClick = async () => {
    let confirmationResult: 'confirm' | 'cancel';

    try {
      confirmationResult = await openConfirmationModalAndWaitForResult({
        legacyCommandActionMenuId,
        title,
        subtitle,
        confirmButtonText,
        confirmButtonAccent,
      });
    } catch {
      // Another confirmation modal is already active.
      return;
    }

    if (confirmationResult === 'confirm') {
      await onConfirmClick();
      closeActionMenu();
    }
  };

  return <ActionDisplay onClick={() => void handleClick()} />;
};
