import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeader = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const ComposerHeader = ({ children }: { children: ReactNode }) => (
  <StyledHeader>{children}</StyledHeader>
);
