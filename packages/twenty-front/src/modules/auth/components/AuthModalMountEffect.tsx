import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useEffect } from 'react';

import { AUTH_MODAL_ID } from '@/auth/constants/AuthModalId';

// TODO: Remove this component when we refactor the auth modal to open it directly in the PageChangeEffect
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
