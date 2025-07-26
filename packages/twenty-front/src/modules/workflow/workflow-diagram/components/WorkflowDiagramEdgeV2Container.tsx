import { css } from '@emotion/react';
import styled from '@emotion/styled';

const StyledContainer = styled.div<{ labelX: number; labelY: number }>`
  padding: ${({ theme }) => theme.spacing(1)};
  pointer-events: all;
  ${({ labelX, labelY }) => css`
    transform: translate(-50%, -50%) translate(${labelX}px, ${labelY}px);
  `}
  position: absolute;
`;

export { StyledContainer as WorkflowDiagramEdgeV2Container };
