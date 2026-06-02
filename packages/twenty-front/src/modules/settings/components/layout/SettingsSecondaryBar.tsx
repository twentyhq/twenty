import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// The secondary row that sits between the header and the body, bracketed by a
// top + bottom border. Holds either <SettingsTabBar/> or <SettingsWizardStepBar/>.
const StyledSecondaryBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  min-height: ${themeCssVariables.spacing[10]};
  padding: 0 ${themeCssVariables.spacing[3]};
  width: 100%;
`;

export const SettingsSecondaryBar = ({ children }: { children: ReactNode }) => (
  <StyledSecondaryBar>{children}</StyledSecondaryBar>
);
