import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledStepListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  padding-block: ${themeCssVariables.spacing[1]};
  padding-inline: ${themeCssVariables.spacing[2]};
`;

export { StyledStepListContainer as SidePanelStepListContainer };
