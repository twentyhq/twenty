import React from 'react';
import styled from '@emotion/styled';

import { Modal as UIModal } from '@/ui/modal/components/Modal';

const StyledContent = styled(UIModal.Content)`
  align-items: center;
  width: calc(400px - ${({ theme }) => theme.spacing(10 * 2)});
`;

type Props = React.ComponentProps<'div'>;

export const AuthModal = ({ children, ...restProps }: Props) => (
  // eslint-disable-next-line twenty/no-spread-props
  <UIModal isOpen={true} {...restProps}>
    <StyledContent>{children}</StyledContent>
  </UIModal>
);
