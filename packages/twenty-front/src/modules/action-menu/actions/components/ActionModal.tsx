import { type ReactNode, useContext } from 'react';
import { t } from '@lingui/core/macro';

import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { CommandMenuItemConfigContext } from '@/action-menu/contexts/CommandMenuItemConfigContext';
import { CommandMenuItemContext } from '@/action-menu/contexts/CommandMenuItemContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type ButtonAccent } from 'twenty-ui/input';

export type ActionModalProps = {
  title: string;
  subtitle: ReactNode;
  onConfirmClick: () => void | Promise<void>;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
  isLoading?: boolean;
  closeSidePanelOnShowPageOptionsActionExecution?: boolean;
  closeSidePanelOnCommandMenuItemListActionExecution?: boolean;
};

export const ActionModal = ({
  title,
  subtitle,
  onConfirmClick,
  confirmButtonText = t`Confirm`,
  confirmButtonAccent = 'danger',
  isLoading = false,
  closeSidePanelOnShowPageOptionsActionExecution,
  closeSidePanelOnCommandMenuItemListActionExecution,
}: ActionModalProps) => {
  const { openModal } = useModal();

  const { closeActionMenu } = useCloseActionMenu({
    closeSidePanelOnShowPageOptionsActionExecution,
    closeSidePanelOnCommandMenuItemListActionExecution,
  });

  const handleConfirmClick = async () => {
    await onConfirmClick();
    closeActionMenu();
  };

  const actionConfig = useContext(CommandMenuItemConfigContext);
  const { actionMenuType } = useContext(CommandMenuItemContext);

  const modalId = `${actionConfig?.key}-action-modal-${actionMenuType}`;

  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    modalId,
  );

  if (!actionConfig) {
    return null;
  }

  const handleClick = () => openModal(modalId);

  return (
    <>
      <ActionDisplay onClick={handleClick} />
      {isModalOpened && (
        <ConfirmationModal
          modalInstanceId={modalId}
          title={title}
          subtitle={subtitle}
          onConfirmClick={handleConfirmClick}
          confirmButtonText={confirmButtonText}
          confirmButtonAccent={confirmButtonAccent}
          loading={isLoading}
        />
      )}
    </>
  );
};
