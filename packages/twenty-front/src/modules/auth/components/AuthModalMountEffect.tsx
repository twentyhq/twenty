import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useEffect } from 'react';

export const AuthModalMountEffect = () => {
  const { openModal } = useModal();

  useEffect(() => {
    openModal('auth-modal');
  }, [openModal]);

  return null;
};
