import React from 'react';
import styled from '@emotion/styled';

const StyledPanel = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: row;
  width: 100%;
`;

export function Panel({ children }: { children: React.ReactNode }) {
  return <StyledPanel>{children}</StyledPanel>;
}
