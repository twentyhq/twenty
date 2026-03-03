import { styled } from '@linaria/react';
import React from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
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
