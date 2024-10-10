import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

type NavigationDrawerCollapsedGreyBoxProps = {
  children: ReactNode;
};

export const NavigationDrawerCollapsedGreyBox = ({
  children,
}: NavigationDrawerCollapsedGreyBoxProps) => {
  return <StyledContainer>{children}</StyledContainer>;
};
