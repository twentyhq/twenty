import { AuthModalMountEffect } from '@/auth/components/AuthModalMountEffect';
import { AUTH_MODAL_ID } from '@/auth/constants/AuthModalId';
import { getAuthModalConfig } from '@/auth/utils/getAuthModalConfig';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import React from 'react';
import { useLocation } from 'react-router-dom';

const StyledContent = styled.div`
  align-items: center;
  justify-content: center;
`;

type AuthModalProps = {
  children: React.ReactNode;
};

export const AuthModal = ({ children }: AuthModalProps) => {
  const location = useLocation();
  const config = getAuthModalConfig(location);

  return (
    <>
      <AuthModalMountEffect />
      <Modal
        modalId={AUTH_MODAL_ID}
        padding="none"
        size={config.size}
        modalVariant={config.variant}
      >
        {config.showScrollWrapper ? (
          <ScrollWrapper componentInstanceId="scroll-wrapper-modal-content">
            <StyledContent>{children}</StyledContent>
          </ScrollWrapper>
        ) : (
          <>{children}</>
        )}
      </Modal>
    </>
  );
};
