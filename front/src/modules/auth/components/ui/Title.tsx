import React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  children: React.ReactNode;
};

const StyledTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizeExtraLarge};
  font-weight: ${({ theme }) => theme.fontWeightSemibold};
  margin-top: ${({ theme }) => theme.spacing(10)};
`;

export function Title({ children }: OwnProps): JSX.Element {
  return <StyledTitle>{children}</StyledTitle>;
}
