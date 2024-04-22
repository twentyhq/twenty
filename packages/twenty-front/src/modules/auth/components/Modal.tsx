import React from 'react';
import styled from '@emotion/styled';

import { ModalLayout } from '@/ui/layout/modal/components/ModalLayout';

const StyledContent = styled(ModalLayout.Content)`
  align-items: center;
  width: calc(400px - ${({ theme }) => theme.spacing(10 * 2)});
`;

type AuthModalProps = { children: React.ReactNode };

export const AuthModal = ({ children }: AuthModalProps) => (
  <ModalLayout padding={'none'}>
    <StyledContent>{children}</StyledContent>
  </ModalLayout>
);
