import { styled } from '@linaria/react';
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
  transform: ${({ position, sourceX, sourceY, centerX, centerY }) => {
    if (isDefined(centerX) && isDefined(centerY)) {
      return `translate(-50%, -50%) translate(${centerX}px, ${centerY}px)`;
    }
    switch (position) {
      case Position.Right:
        return `translate(0%, -50%) translate(${Math.floor(sourceX)}px, ${sourceY}px) translateX(10px)`;
      case Position.Bottom:
        return `translate(-50%, 0%) translate(${sourceX}px, ${Math.floor(sourceY)}px) translateY(10px)`;
      default:
        return 'none';
    }
  }};

  width: fit-content;
`;

export { StyledWorkflowDiagramEdgeLabelContainer as WorkflowDiagramEdgeLabelContainer };
