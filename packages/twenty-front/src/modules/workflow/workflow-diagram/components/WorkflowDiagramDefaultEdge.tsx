import { useTheme } from '@emotion/react';
import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';

type WorkflowDiagramDefaultEdgeProps = EdgeProps;

export const WorkflowDiagramDefaultEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerStart,
  markerEnd,
}: WorkflowDiagramDefaultEdgeProps) => {
  const theme = useTheme();

  const [edgePath] = getStraightPath({
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
