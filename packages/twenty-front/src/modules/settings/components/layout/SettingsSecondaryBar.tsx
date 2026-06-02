import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsSecondaryBarProps = {
  children: ReactNode;
};

const SECONDARY_BAR_HEIGHT = 48;

// Mirror SettingsPageHeader's grid + asymmetric padding so the centered slot
// here lands at the exact same horizontal center as the title above.
const StyledBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  height: ${SECONDARY_BAR_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[3]} 0 ${themeCssVariables.spacing[4]};
  position: relative;
  width: 100%;
`;

const StyledCenter = styled.div`
  align-items: center;
  display: flex;
  grid-column: 2;
  justify-content: center;
`;

// SettingsSecondaryBar is a generic centered slot. Pass SettingsTabBar for
// tabbed pages or SettingsWizardStepBar for step-based pages.
export const SettingsSecondaryBar = ({
  children,
}: SettingsSecondaryBarProps) => (
  <StyledBar>
    <StyledCenter>{children}</StyledCenter>
  </StyledBar>
);
