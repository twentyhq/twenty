import { type ReactNode, useContext } from 'react';
import { t } from '@lingui/core/macro';

import { CommandMenuItemDisplay } from '@/command-menu-item/actions/display/components/CommandMenuItemDisplay';
import { CommandMenuItemConfigContext } from '@/command-menu-item/contexts/CommandMenuItemConfigContext';
import { CommandMenuItemContext } from '@/command-menu-item/contexts/CommandMenuItemContext';
import { useCloseActionMenu } from '@/command-menu-item/hooks/useCloseActionMenu';
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

export const CommandMenuItemModal = ({
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
      <CommandMenuItemDisplay onClick={handleClick} />
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
