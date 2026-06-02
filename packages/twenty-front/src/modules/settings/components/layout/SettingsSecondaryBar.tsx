import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsSecondaryBarProps = {
  children: ReactNode;
};

const SECONDARY_BAR_HEIGHT = 48;

// Lives inside PagePanel (the white rounded card), so no background of its own
// and no top border — the panel's rounded edge above is the visual top.
// A single bottom border separates the tabs from the body content underneath.
const StyledBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: grid;
  flex-shrink: 0;
  grid-template-columns: 1fr auto 1fr;
  height: ${SECONDARY_BAR_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[4]};
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
