import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSidePanelContextChipIconWrapper = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  justify-content: center;
`;

export const SidePanelContextChipIconWrapper =
  StyledSidePanelContextChipIconWrapper;
