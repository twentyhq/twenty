import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useEffect } from 'react';

import { AUTH_MODAL_ID } from '../constants/AuthModalId';

export const AuthModalMountEffect = () => {
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    openModal(AUTH_MODAL_ID);

    return () => {
      closeModal(AUTH_MODAL_ID);
    };
  }, [openModal, closeModal]);

  return null;
};
