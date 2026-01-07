import { type ReactNode, useContext } from 'react';
import { t } from '@lingui/core/macro';

import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { type ButtonAccent } from 'twenty-ui/input';

export type ActionModalProps = {
  title: string;
  subtitle: ReactNode;
  onConfirmClick: () => void | Promise<void>;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
  isLoading?: boolean;
  closeSidePanelOnShowPageOptionsActionExecution?: boolean;
  closeSidePanelOnCommandMenuListActionExecution?: boolean;
};

export const ActionModal = ({
  title,
  subtitle,
  onConfirmClick,
  confirmButtonText = t`Confirm`,
  confirmButtonAccent = 'danger',
  isLoading = false,
  closeSidePanelOnShowPageOptionsActionExecution,
  closeSidePanelOnCommandMenuListActionExecution,
}: ActionModalProps) => {
  const { openModal } = useModal();

  const { closeActionMenu } = useCloseActionMenu({
    closeSidePanelOnShowPageOptionsActionExecution,
    closeSidePanelOnCommandMenuListActionExecution,
  });

  const handleConfirmClick = async () => {
    await onConfirmClick();
    closeActionMenu();
  };

  const actionConfig = useContext(ActionConfigContext);
  const { actionMenuType } = useContext(ActionMenuContext);

  const modalId = `${actionConfig?.key}-action-modal-${actionMenuType}`;

  const isModalOpened = useRecoilComponentValue(
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
          modalId={modalId}
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
