import { type ReactNode, useContext } from 'react';
import { t } from '@lingui/core/macro';

import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useActionMenuConfirmationModal } from '@/action-menu/confirmation-modal/hooks/useActionMenuConfirmationModal';
import { ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME } from '@/action-menu/confirmation-modal/constants/ActionMenuConfirmationModalResultBrowserEventName';
import { type ActionMenuConfirmationModalResultBrowserEventDetail } from '@/action-menu/confirmation-modal/types/ActionMenuConfirmationModalResultBrowserEventDetail';
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
  const { openConfirmationModal } = useActionMenuConfirmationModal();
  const { closeActionMenu } = useCloseActionMenu({
    closeSidePanelOnShowPageOptionsActionExecution,
    closeSidePanelOnCommandMenuListActionExecution,
  });
  const frontComponentId = actionConfig
    ? `${actionMenuComponentInstanceId}:${actionMenuContext.actionMenuType}:${actionMenuContext.displayType}:${actionConfig.key}`
    : null;

  if (!actionConfig || frontComponentId === null) {
    return null;
  }

  const handleClick = () => {
    const handler = async (event: Event) => {
      const detail = (
        event as CustomEvent<ActionMenuConfirmationModalResultBrowserEventDetail>
      ).detail;

      if (detail.frontComponentId !== frontComponentId) {
        return;
      }

      window.removeEventListener(
        ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
        handler,
      );

      if (detail.result === 'confirm') {
        await onConfirmClick();
        closeActionMenu();
      }
    };

    window.addEventListener(
      ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
      handler,
    );

    try {
      openConfirmationModal({
        frontComponentId,
        title,
        subtitle,
        confirmButtonText,
        confirmButtonAccent,
      });
    } catch {
      window.removeEventListener(
        ACTION_MENU_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
        handler,
      );
    }
  };

  return <ActionDisplay onClick={handleClick} />;
};
