import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsSecondaryBarProps = {
  children: ReactNode;
};

const SECONDARY_BAR_HEIGHT = 40;

const StyledBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.noisy};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  height: ${SECONDARY_BAR_HEIGHT}px;
  justify-content: center;
  padding: 0 ${themeCssVariables.spacing[4]};
  position: relative;
  width: 100%;
`;

// SettingsSecondaryBar is a generic centered slot. Pass SettingsTabBar for
// tabbed pages or SettingsWizardStepBar for step-based pages.
export const SettingsSecondaryBar = ({
  children,
}: SettingsSecondaryBarProps) => <StyledBar>{children}</StyledBar>;
