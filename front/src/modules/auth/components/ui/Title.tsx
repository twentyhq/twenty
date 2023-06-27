import React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  children: React.ReactNode;
};

const StyledTitle = styled.div`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-top: ${({ theme }) => theme.spacing(10)};
`;

export function Title({ children }: OwnProps): JSX.Element {
  return <StyledTitle>{children}</StyledTitle>;
}
