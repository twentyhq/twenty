import { ReactNode, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

import { ActionConfigContext } from '@/action-menu/actions/components/ActionConfigContext';
import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useCloseActionMenu } from '@/action-menu/hooks/useCloseActionMenu';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { ButtonAccent } from 'twenty-ui';

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
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const { closeActionMenu } = useCloseActionMenu();

  const handleConfirmClick = useCallback(() => {
    closeActionMenu();
    onConfirmClick();
    setIsOpen(false);
  }, [closeActionMenu, onConfirmClick]);

  const actionConfig = useContext(ActionConfigContext);

  if (!actionConfig) {
    return null;
  }

  return (
    <>
      <ActionDisplay action={{ ...actionConfig, onClick: handleOpen }} />
      {isOpen &&
        createPortal(
          <ConfirmationModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
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
