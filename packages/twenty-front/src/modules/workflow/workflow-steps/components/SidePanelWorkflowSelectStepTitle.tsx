import { themeCssVariables } from 'twenty-ui/theme';
import { styled } from '@linaria/react';

const StyledSelectStepTitle = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-inline-start: ${themeCssVariables.spacing[1]};
  padding-inline-end: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

export { StyledSelectStepTitle as SidePanelWorkflowSelectStepTitle };
