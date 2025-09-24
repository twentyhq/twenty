import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getEdgePath } from '@/workflow/workflow-diagram/workflow-edges/utils/getEdgePath';
import { useTheme } from '@emotion/react';
import { BaseEdge, type EdgeProps } from '@xyflow/react';

type WorkflowDiagramBlankEdgeProps = EdgeProps<WorkflowDiagramEdge>;

export const WorkflowDiagramBlankEdge = ({
  markerStart,
  markerEnd,
  sourceY,
  sourceX,
  sourcePosition,
  targetY,
  targetX,
  targetPosition,
}: WorkflowDiagramBlankEdgeProps) => {
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
