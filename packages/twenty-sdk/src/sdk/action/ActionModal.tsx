import { useEffect, useRef } from 'react';

import {
  openConfirmationModal,
  unmountFrontComponent,
} from '../front-component-api';

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

    const run = async () => {
      const confirmed = await openConfirmationModal({
        title,
        subtitle,
        confirmButtonText,
        confirmButtonAccent,
      });

      if (confirmed) {
        await onConfirmClick();
      }

      await unmountFrontComponent();
    };

    run();
  }, [title, subtitle, onConfirmClick, confirmButtonText, confirmButtonAccent]);

  return null;
};
