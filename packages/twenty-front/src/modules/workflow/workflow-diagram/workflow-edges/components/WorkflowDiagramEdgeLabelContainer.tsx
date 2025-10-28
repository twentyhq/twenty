import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Position } from '@xyflow/react';

const StyledWorkflowDiagramEdgeLabelContainer = styled.div<{
  sourceX: number;
  sourceY: number;
  position: Position;
}>`
  position: absolute;
  width: fit-content;

  ${({ position, sourceX, sourceY }) => {
    switch (position) {
      case Position.Right: {
        return css`
          transform: translate(0%, -50%)
            translate(${Math.floor(sourceX)}px, ${sourceY}px) translateX(10px);
        `;
      }
      case Position.Bottom: {
        return css`
          transform: translate(-50%, 0%)
            translate(${sourceX}px, ${Math.floor(sourceY)}px) translateY(10px);
        `;
      }
    }
  }}
`;

export { StyledWorkflowDiagramEdgeLabelContainer as WorkflowDiagramEdgeLabelContainer };
