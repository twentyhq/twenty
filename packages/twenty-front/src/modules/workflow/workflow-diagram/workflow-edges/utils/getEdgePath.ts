import { type WorkflowDiagramEdgePathStrategy } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { getBezierPath, getSmoothStepPath, Position } from '@xyflow/react';

const EDGE_PADDING_BOTTOM = 40;
const EDGE_PADDING_X = 40;
const EDGE_BORDER_RADIUS = 16;

type GetEdgePathParams = Pick<
  WorkflowDiagramEdgeComponentProps,
  | 'sourceX'
  | 'sourceY'
  | 'sourcePosition'
  | 'targetX'
  | 'targetY'
  | 'targetPosition'
  | 'markerStart'
  | 'markerEnd'
> & {
  strategy?: WorkflowDiagramEdgePathStrategy;
};

export const getEdgePath = ({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerStart,
  markerEnd,
  strategy,
}: GetEdgePathParams) => {
  if (strategy === 'smooth-step-path-to-target') {
    const [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: EDGE_BORDER_RADIUS,
      offset: EDGE_PADDING_X,
    });

    const overlayY =
      targetY - sourceY > EDGE_PADDING_BOTTOM &&
      sourceX + EDGE_PADDING_X < targetX
        ? targetY - (targetY - sourceY) / 2
        : targetY - EDGE_PADDING_BOTTOM / 2;

    return {
      segments: [
        {
          path,
          markerStart,
          markerEnd,
        },
      ],
      overlayPosition: [targetX, overlayY],
    };
  }

  if (sourceY < targetY) {
    const [path, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    return {
      segments: [
        {
          path,
          markerStart,
          markerEnd,
        },
      ],
      overlayPosition: [labelX, labelY],
    };
  }

  const firstSegmentTargetX =
    strategy === 'bypass-source-node-on-right-side'
      ? sourceX + 200
      : (sourceX + targetX) / 2;
  const firstSegmentTargetY = sourceY + EDGE_PADDING_BOTTOM;
  const firstSegment = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX: firstSegmentTargetX,
    targetY: firstSegmentTargetY,
    sourcePosition,
    targetPosition: Position.Bottom,
    borderRadius: EDGE_BORDER_RADIUS,
    offset: EDGE_PADDING_X,
  });

  const secondSegment = getSmoothStepPath({
    sourceX: firstSegmentTargetX,
    sourceY: firstSegmentTargetY,
    targetX,
    targetY,
    sourcePosition: Position.Top,
    targetPosition,
    borderRadius: EDGE_BORDER_RADIUS,
    offset: EDGE_PADDING_X,
  });

  return {
    segments: [
      {
        path: firstSegment[0],
        markerStart,
        markerEnd: undefined,
      },
      {
        path: secondSegment[0],
        markerStart: undefined,
        markerEnd,
      },
    ],
    overlayPosition:
      strategy === 'bypass-source-node-on-right-side'
        ? [sourceX, sourceY + EDGE_PADDING_BOTTOM]
        : [firstSegmentTargetX, firstSegmentTargetY],
  };
};
