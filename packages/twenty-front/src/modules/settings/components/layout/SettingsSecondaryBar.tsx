import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

// Bottom separator is an ::after (not border-bottom), and the bar keeps full
// height (default align-items) so the active tab's underline lands exactly on it.
const StyledSecondaryBar = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  min-height: ${themeCssVariables.spacing[10]};
  padding: 0 ${themeCssVariables.spacing[3]};
  position: relative;
  width: 100%;

  &::after {
    background-color: ${themeCssVariables.border.color.light};
    bottom: 0;
    content: '';
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }
`;

export const SettingsSecondaryBar = ({ children }: { children: ReactNode }) => (
  <StyledSecondaryBar>{children}</StyledSecondaryBar>
);
