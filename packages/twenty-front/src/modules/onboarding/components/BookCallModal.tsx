import { BookCallModalMountEffect } from '@/onboarding/components/BookCallModalMountEffect';
import { BOOK_CALL_MODAL_ID } from '@/onboarding/constants/BookCallModalId';
import {
  Modal,
  ModalSize,
  ModalVariants,
} from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import React from 'react';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 90vh;
  width: 100%;
`;

type BookCallModalProps = {
  children: React.ReactNode;
  size?: ModalSize;
  modalVariant?: ModalVariants;
};

export const BookCallModal = ({
  children,
  size = 'xl',
}: BookCallModalProps) => (
  <>
    <BookCallModalMountEffect />
    <Modal
      modalId={BOOK_CALL_MODAL_ID}
      size={size}
      padding={'none'}
      modalVariant={'transparent'}
    >
      <StyledContent>{children}</StyledContent>
    </Modal>
  </>
);
