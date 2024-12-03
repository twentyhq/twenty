import { Modal } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import React from 'react';

const StyledContent = styled(Modal.Content)`
  align-items: center;
`;

type AuthModalProps = { children: React.ReactNode };

export const AuthModal = ({ children }: AuthModalProps) => (
  <Modal padding={'none'} modalVariant="primary" className="justify-center">
    <StyledContent>{children}</StyledContent>
  </Modal>
);
