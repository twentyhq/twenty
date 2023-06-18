import React from 'react';
import styled from '@emotion/styled';

type OwnProps = {
  children: React.ReactNode;
};

const StyledContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.text40};
  display: flex;
  font-size: ${({ theme }) => theme.fontSizeSmall}px;
  padding-left: ${({ theme }) => theme.spacing(14)};
  padding-right: ${({ theme }) => theme.spacing(14)};
  text-align: center;
`;

export function FooterNote({ children }: OwnProps): JSX.Element {
  return <StyledContainer>{children}</StyledContainer>;
}
