import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useTheme } from '@emotion/react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

type WorkflowDiagramDefaultEdgeReadonlyProps = EdgeProps<WorkflowDiagramEdge>;

export const WorkflowDiagramDefaultEdgeReadonly = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerStart,
  markerEnd,
}: WorkflowDiagramDefaultEdgeReadonlyProps) => {
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
