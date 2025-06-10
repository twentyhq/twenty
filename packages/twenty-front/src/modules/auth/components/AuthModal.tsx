import { AuthModalMountEffect } from '@/auth/components/AuthModalMountEffect';
import { AUTH_MODAL_ID } from '@/auth/constants/AuthModalId';
import {
  Modal,
  ModalSize,
  ModalVariants,
} from '@/ui/layout/modal/components/Modal';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import React from 'react';

const StyledContent = styled.div`
  align-items: center;
  justify-content: center;
`;

type AuthModalProps = {
  children: React.ReactNode;
  size?: ModalSize;
  modalVariant?: ModalVariants;
};

export const AuthModal = ({
  children,
  size = 'medium',
  modalVariant,
}: AuthModalProps) => (
  <>
    <AuthModalMountEffect />
    <Modal
      modalId={AUTH_MODAL_ID}
      padding={'none'}
      modalVariant={modalVariant}
      size={size}
    >
      <ScrollWrapper componentInstanceId="scroll-wrapper-modal-content">
        <StyledContent>{children}</StyledContent>
      </ScrollWrapper>
    </Modal>
  </>
);
