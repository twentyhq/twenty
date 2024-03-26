import React from 'react';
import styled from '@emotion/styled';

import { Modal as UIModal } from '@/ui/layout/modal/components/Modal';

const StyledContent = styled(UIModal.Content)`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(0)};
  width: 100%;
`;

type AuthModalProps = { children: React.ReactNode };

export const AuthModal = ({ children }: AuthModalProps) => (
  <UIModal isOpen={true} padding={'none'} size="extralarge">
    <StyledContent>{children}</StyledContent>
  </UIModal>
);
