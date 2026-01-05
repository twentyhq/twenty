import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Position } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';

const StyledWorkflowDiagramEdgeLabelContainer = styled.div<{
  sourceX: number;
  sourceY: number;
  position: Position;
  centerX?: number;
  centerY?: number;
}>`
  position: absolute;
  width: fit-content;

  ${({ position, sourceX, sourceY, centerX, centerY }) => {
    if (isDefined(centerX) && isDefined(centerY)) {
      return css`
        transform: translate(-50%, -50%) translate(${centerX}px, ${centerY}px);
      `;
    }

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
