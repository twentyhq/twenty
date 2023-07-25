import React from 'react';
import styled from '@emotion/styled';

import { Modal as UIModal } from '@/ui/modal/components/Modal';

type Props = React.ComponentProps<'div'>;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(10)};
  width: calc(400px - ${({ theme }) => theme.spacing(10 * 2)});
`;

export function AuthModal({ children, ...restProps }: Props) {
  return (
    <UIModal isOpen={true}>
      <StyledContainer {...restProps}>{children}</StyledContainer>
    </UIModal>
  );
}
