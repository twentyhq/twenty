import React from 'react';
import styled from '@emotion/styled';

import { Modal as UIModal } from '@/ui/modal/components/Modal';

const StyledContent = styled(UIModal.Content)`
  align-items: center;
  width: calc(400px - ${({ theme }) => theme.spacing(10 * 2)});
`;

type AuthModalProps = { children: React.ReactNode };

export const AuthModal = ({ children }: AuthModalProps) => (
  <UIModal isOpen={true}>
    <StyledContent>{children}</StyledContent>
  </UIModal>
);
