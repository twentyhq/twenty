import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledContainer = styled.div<{ labelX: number; labelY: number }>`
  padding: ${themeCssVariables.spacing[1]};
  pointer-events: all;
  position: absolute;
  transform: ${({ labelX, labelY }) =>
    `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`};
`;

export { StyledContainer as WorkflowDiagramEdgeV2Container };
