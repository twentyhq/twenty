import { useTheme } from '@emotion/react';
import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';
import { CREATE_STEP_NODE_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';

type WorkflowDiagramDefaultEdgeProps = EdgeProps;

export const WorkflowDiagramDefaultEdge = ({
  sourceY,
  targetY,
  markerStart,
  markerEnd,
}: WorkflowDiagramDefaultEdgeProps) => {
  const theme = useTheme();

  const [edgePath] = getStraightPath({
    sourceX: CREATE_STEP_NODE_WIDTH,
    sourceY,
    targetX: CREATE_STEP_NODE_WIDTH,
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
