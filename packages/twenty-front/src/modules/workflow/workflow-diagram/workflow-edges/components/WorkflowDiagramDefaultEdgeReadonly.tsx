import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { getEdgePath } from '@/workflow/workflow-diagram/workflow-edges/utils/getEdgePath';
import { useTheme } from '@emotion/react';
import { BaseEdge } from '@xyflow/react';

type WorkflowDiagramDefaultEdgeReadonlyProps =
  WorkflowDiagramEdgeComponentProps;

export const WorkflowDiagramDefaultEdgeReadonly = ({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerStart,
  markerEnd,
}: WorkflowDiagramDefaultEdgeReadonlyProps) => {
  const theme = useTheme();

  const { segments } = getEdgePath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    markerStart,
    markerEnd,
  });

  return (
    <>
      {segments.map((segment) => (
        <BaseEdge
          key={segment.path}
          markerStart={segment.markerStart}
          markerEnd={segment.markerEnd}
          path={segment.path}
          style={{ stroke: theme.border.color.strong }}
        />
      ))}
    </>
  );
};
