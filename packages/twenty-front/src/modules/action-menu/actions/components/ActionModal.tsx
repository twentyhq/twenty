import { ReactNode, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';

import { Action } from '@/action-menu/actions/components/Action';
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

  const handleConfirmClick = useCallback(() => {
    onConfirmClick();
    setIsOpen(false);
  }, [onConfirmClick]);

  return (
    <>
      <Action onClick={handleOpen} />
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
