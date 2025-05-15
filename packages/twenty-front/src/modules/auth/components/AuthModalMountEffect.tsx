import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useEffect } from 'react';

import { AUTH_MODAL_ID } from '../constants/authModalIds';

export const AuthModalMountEffect = () => {
  const { openModal } = useModal();

  useEffect(() => {
    openModal(AUTH_MODAL_ID);
  }, [openModal]);

  return null;
};
