import React from 'react';
import styled from '@emotion/styled';

import { Modal as UIModal } from '@/ui/components/modal/Modal';

type OwnProps = {
  children: React.ReactNode;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-bottom: ${({ theme }) => theme.spacing(10)};
  padding-top: ${({ theme }) => theme.spacing(10)};
  width: 400px;
`;

export function Modal({ children }: OwnProps): JSX.Element {
  return (
    <UIModal>
      <StyledContainer>{children}</StyledContainer>
    </UIModal>
  );
}
