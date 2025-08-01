import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useTheme } from '@emotion/react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

type WorkflowDiagramBlankEdgeProps = EdgeProps<WorkflowDiagramEdge>;

export const WorkflowDiagramBlankEdge = ({
  markerStart,
  markerEnd,
  sourceY,
  sourceX,
  targetY,
  targetX,
}: WorkflowDiagramBlankEdgeProps) => {
  const theme = useTheme();

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge
      markerStart={markerStart}
      markerEnd={markerEnd}
      path={edgePath}
      style={{ stroke: theme.border.color.strong }}
    />
  );
};
