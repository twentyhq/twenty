import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledSelectStepTitle = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

export { StyledSelectStepTitle as SidePanelWorkflowSelectStepTitle };
