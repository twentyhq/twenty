import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useEffect } from 'react';

import { BOOK_CALL_MODAL_ID } from '../constants/BookCallModalId';

export const BookCallModalMountEffect = () => {
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    openModal(BOOK_CALL_MODAL_ID);

    return () => {
      closeModal(BOOK_CALL_MODAL_ID);
    };
  }, [openModal, closeModal]);

  return null;
};
