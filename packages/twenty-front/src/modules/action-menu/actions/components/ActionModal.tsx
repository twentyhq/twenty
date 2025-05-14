import { ReactNode, useContext } from 'react';
import { createPortal } from 'react-dom';

import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ButtonAccent } from 'twenty-ui/input';

export type ActionModalProps = {
  title: string;
  subtitle: ReactNode;
  onConfirmClick: () => void;
  confirmButtonText?: string;
  confirmButtonAccent?: ButtonAccent;
  isLoading?: boolean;
};

export const ActionModal = ({
  title,
  subtitle,
  onConfirmClick,
  confirmButtonText = 'Confirm',
  confirmButtonAccent = 'danger',
  isLoading = false,
}: ActionModalProps) => {
  const { openModal } = useModal();

  const { closeActionMenu } = useCloseActionMenu();

  const handleConfirmClick = () => {
    onConfirmClick();
    closeActionMenu();
  };

  const actionConfig = useContext(ActionConfigContext);

  if (!actionConfig) {
    return null;
  }

  return (
    <>
      <ActionDisplay
        onClick={() => openModal(`${actionConfig.key}-action-modal`)}
      />
      {createPortal(
        <ConfirmationModal
          modalId={`${actionConfig.key}-action-modal`}
          title={title}
          subtitle={subtitle}
          onConfirmClick={handleConfirmClick}
          confirmButtonText={confirmButtonText}
          confirmButtonAccent={confirmButtonAccent}
          loading={isLoading}
        />,
        document.body,
      )}
    </>
  );
};
