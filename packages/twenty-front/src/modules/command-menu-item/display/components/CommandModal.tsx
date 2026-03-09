import { type ReactNode, useContext } from 'react';
import { t } from '@lingui/core/macro';

import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCloseCommandMenu } from '@/command-menu-item/hooks/useCloseCommandMenu';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type ButtonAccent } from 'twenty-ui/input';

export type CommandModalProps = {
  title: string;
  subtitle: ReactNode;
  onConfirmClick: () => void | Promise<void>;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
  isLoading?: boolean;
  closeSidePanelOnShowPageOptionsExecution?: boolean;
  closeSidePanelOnCommandMenuListExecution?: boolean;
};

export const CommandModal = ({
  title,
  subtitle,
  onConfirmClick,
  confirmButtonText = t`Confirm`,
  confirmButtonAccent = 'danger',
  isLoading = false,
  closeSidePanelOnShowPageOptionsExecution,
  closeSidePanelOnCommandMenuListExecution,
}: CommandModalProps) => {
  const { openModal } = useModal();

  const { closeCommandMenu } = useCloseCommandMenu({
    closeSidePanelOnShowPageOptionsExecution,
    closeSidePanelOnCommandMenuListExecution,
  });

  const handleConfirmClick = async () => {
    await onConfirmClick();
    closeCommandMenu();
  };

  const commandMenuItemConfig = useContext(CommandConfigContext);
  const { containerType } = useContext(CommandMenuContext);

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
