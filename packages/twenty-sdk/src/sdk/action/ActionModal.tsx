import { useEffect, useRef } from 'react';

import { openConfirmationModal } from '../front-component-api';

export type ActionModalProps = {
  title: string;
  subtitle: string;
  onConfirmClick: () => void | Promise<void>;
  confirmButtonText?: string;
  confirmButtonAccent?: 'danger' | 'default' | 'blue';
};

export const ActionModal = ({
  title,
  subtitle,
  onConfirmClick,
  confirmButtonText = 'Confirm',
  confirmButtonAccent = 'danger',
}: ActionModalProps) => {
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) {
      return;
    }
    hasExecutedRef.current = true;

    openConfirmationModal({
      title,
      subtitle,
      confirmButtonText,
      confirmButtonAccent,
    }).then((confirmed) => {
      if (confirmed) {
        onConfirmClick();
      }
    });
  }, [title, subtitle, onConfirmClick, confirmButtonText, confirmButtonAccent]);

  return null;
};
