import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { useTheme } from '@emotion/react';
import { BaseEdge, getBezierPath } from '@xyflow/react';

type WorkflowDiagramDefaultEdgeReadonlyProps =
  WorkflowDiagramEdgeComponentProps;

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
