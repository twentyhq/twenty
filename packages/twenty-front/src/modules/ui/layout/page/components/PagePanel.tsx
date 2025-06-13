import styled from '@emotion/styled';
import React from 'react';

const StyledPanel = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

type PagePanelProps = {
  children: React.ReactNode;
  hasInformationBar?: boolean;
};

export const PagePanel = ({ children }: PagePanelProps) => (
  <StyledPanel>{children}</StyledPanel>
);
