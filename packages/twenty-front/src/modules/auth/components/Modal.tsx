import React from 'react';
import styled from '@emotion/styled';

import {
  Modal as UIModal,
  ModalPadding,
} from '@/ui/layout/modal/components/Modal';

const StyledContent = styled(UIModal.Content)`
  align-items: center;
  width: calc(400px - ${({ theme }) => theme.spacing(10 * 2)});
`;

type AuthModalProps = { children: React.ReactNode; padding?: ModalPadding };

export const AuthModal = ({ children, padding }: AuthModalProps) => (
  <UIModal isOpen={true} padding={padding}>
    <StyledContent>{children}</StyledContent>
  </UIModal>
);
