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
  parallelEdgeOffset?: number;
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
  parallelEdgeOffset,
}: GetEdgePathParams) => {
  if (strategy === 'parallel-edge' && sourceY < targetY) {
    const middleX = (sourceX + targetX) / 2 + (parallelEdgeOffset ?? 0);
    const middleY = (sourceY + targetY) / 2;
    const [firstPath] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX: middleX,
      targetY: middleY,
      targetPosition: Position.Top,
    });
    const [secondPath] = getBezierPath({
      sourceX: middleX,
      sourceY: middleY,
      sourcePosition: Position.Bottom,
      targetX,
      targetY,
      targetPosition,
    });

    return {
      segments: [
        { path: firstPath, markerStart, markerEnd: undefined },
        { path: secondPath, markerStart: undefined, markerEnd },
      ],
      overlayPosition: [middleX, middleY],
    };
  }

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
    (strategy === 'bypass-source-node-on-right-side'
      ? sourceX + 200
      : (sourceX + targetX) / 2) +
    (strategy === 'parallel-edge' ? (parallelEdgeOffset ?? 0) : 0);
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
