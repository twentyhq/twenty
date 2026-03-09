import { AuthModalMountEffect } from '@/auth/components/AuthModalMountEffect';
import { AUTH_MODAL_ID } from '@/auth/constants/AuthModalId';
import { getAuthModalConfig } from '@/auth/utils/getAuthModalConfig';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { styled } from '@linaria/react';
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
      <ModalStatefulWrapper
        modalInstanceId={AUTH_MODAL_ID}
        padding="none"
        size={config.size}
        overlay={config.overlay}
      >
        {config.showScrollWrapper ? (
          <ScrollWrapper componentInstanceId="scroll-wrapper-modal-content">
            <StyledContent>{children}</StyledContent>
          </ScrollWrapper>
        ) : (
          <>{children}</>
        )}
      </ModalStatefulWrapper>
    </>
  );
};
