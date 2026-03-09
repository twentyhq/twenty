import { type ReactNode, useContext } from 'react';
import { t } from '@lingui/core/macro';

import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { CommandMenuItemConfigContext } from '@/command-menu-item/contexts/CommandMenuItemConfigContext';
import { CommandMenuItemContext } from '@/command-menu-item/contexts/CommandMenuItemContext';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type ButtonAccent } from 'twenty-ui/input';

export type CommandMenuItemModalProps = {
  title: string;
  subtitle: ReactNode;
  onConfirmClick: () => void | Promise<void>;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
  isLoading?: boolean;
  closeSidePanelOnShowPageOptionsCommandExecution?: boolean;
  closeSidePanelOnCommandMenuItemListCommandExecution?: boolean;
};

export const CommandMenuItemModal = ({
  title,
  subtitle,
  onConfirmClick,
  confirmButtonText = t`Confirm`,
  confirmButtonAccent = 'danger',
  isLoading = false,
  closeSidePanelOnShowPageOptionsCommandExecution,
  closeSidePanelOnCommandMenuItemListCommandExecution,
}: CommandMenuItemModalProps) => {
  const { openModal } = useModal();

  const { closeCommandMenu } = useCloseCommandMenu({
    closeSidePanelOnShowPageOptionsCommandExecution,
    closeSidePanelOnCommandMenuItemListCommandExecution,
  });

  const handleConfirmClick = async () => {
    await onConfirmClick();
    closeCommandMenu();
  };

  const commandMenuItemConfig = useContext(CommandMenuItemConfigContext);
  const { containerType } = useContext(CommandMenuItemContext);

  const modalId = `${commandMenuItemConfig?.key}-command-menu-item-modal-${containerType}`;

  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    modalId,
  );

  if (!commandMenuItemConfig) {
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
