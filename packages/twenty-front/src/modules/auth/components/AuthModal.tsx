import { AuthModalMountEffect } from '@/auth/components/AuthModalMountEffect';
import { AUTH_MODAL_ID } from '@/auth/constants/AuthModalId';
import { AppPath } from '@/types/AppPath';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

const StyledContent = styled.div`
  align-items: center;
  justify-content: center;
`;

type AuthModalProps = {
  children: React.ReactNode;
};

export const AuthModal = ({ children }: AuthModalProps) => {
  const location = useLocation();

  // I don't like this, but it's the only way to get the size of the modal to work
  // TODO: find a better way to do this
  const isBookCall = isMatchingLocation(location, AppPath.BookCall);

  return (
    <>
      <AuthModalMountEffect />
      <Modal
        modalId={AUTH_MODAL_ID}
        padding={'none'}
        size={isBookCall ? 'large' : 'medium'}
        modalVariant={isBookCall ? 'transparent' : 'primary'}
      >
        {isBookCall ? (
          <>{children}</>
        ) : (
          <ScrollWrapper componentInstanceId="scroll-wrapper-modal-content">
            <StyledContent>{children}</StyledContent>
          </ScrollWrapper>
        )}
      </Modal>
    </>
  );
};
