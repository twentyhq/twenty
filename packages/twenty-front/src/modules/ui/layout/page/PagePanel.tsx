import React from 'react';
import styled from '@emotion/styled';

const StyledPanel = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 100%;
  overflow: auto;
  width: 100%;
`;

export const PagePanel = ({ children }: { children: React.ReactNode }) => (
  <StyledPanel>{children}</StyledPanel>
);
