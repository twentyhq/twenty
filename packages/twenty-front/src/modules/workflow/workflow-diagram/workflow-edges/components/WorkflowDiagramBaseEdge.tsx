import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { useTheme } from '@emotion/react';
import { BaseEdge, type EdgeProps } from '@xyflow/react';

type WorkflowDiagramBaseEdgeProps = Pick<
  EdgeProps<WorkflowDiagramEdge>,
  | 'source'
  | 'sourceHandleId'
  | 'target'
  | 'targetHandleId'
  | 'markerStart'
  | 'markerEnd'
> & {
  path: string;
};

export const WorkflowDiagramBaseEdge = ({
  source,
  target,
  sourceHandleId,
  targetHandleId,
  markerStart,
  markerEnd,
  path,
}: WorkflowDiagramBaseEdgeProps) => {
  const theme = useTheme();

  const { isEdgeSelected, isEdgeHovered } = useEdgeState();

  const selected = isEdgeSelected({
    source,
    target,
    sourceHandle: sourceHandleId,
    targetHandle: targetHandleId,
  });

  const isHovered = isEdgeHovered({
    source,
    target,
    sourceHandle: sourceHandleId,
    targetHandle: targetHandleId,
  });

  const stroke = selected
    ? theme.color.blue
    : isHovered
      ? theme.font.color.light
      : theme.border.color.strong;

  return (
    <BaseEdge
      markerStart={markerStart}
      markerEnd={markerEnd}
      path={path}
      style={{
        stroke,
      }}
    />
  );
};
