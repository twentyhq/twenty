import styled from '@emotion/styled';
import React from 'react';

import { ModalLayout } from '@/ui/layout/modal/components/ModalLayout';

const StyledContent = styled(ModalLayout.Content)`
  align-items: center;
  justify-content: center;
`;

type AuthModalProps = { children: React.ReactNode };

export const AuthModal = ({ children }: AuthModalProps) => (
  <ModalLayout padding={'none'}>
    <StyledContent>{children}</StyledContent>
  </ModalLayout>
);
