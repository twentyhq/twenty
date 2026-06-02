import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsSecondaryBarProps = {
  children: ReactNode;
};

const SECONDARY_BAR_HEIGHT = 48;

// Lives at the top of StyledPanel (the rounded white card). The panel's
// rounded top edge serves as the bar's top boundary, so no top border or
// background of its own — just a bottom border separating tabs from the
// body content underneath.
const StyledBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  height: ${SECONDARY_BAR_HEIGHT}px;
  justify-content: center;
  padding: 0 ${themeCssVariables.spacing[4]};
  width: 100%;
`;

// SettingsSecondaryBar is a generic centered slot. Pass SettingsTabBar for
// tabbed pages or SettingsWizardStepBar for step-based pages.
export const SettingsSecondaryBar = ({
  children,
}: SettingsSecondaryBarProps) => <StyledBar>{children}</StyledBar>;
