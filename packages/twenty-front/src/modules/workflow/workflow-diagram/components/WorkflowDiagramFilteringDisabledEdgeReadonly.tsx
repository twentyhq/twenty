import { CREATE_STEP_NODE_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useTheme } from '@emotion/react';
import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';

type WorkflowDiagramFilteringDisabledEdgeReadonlyProps =
  EdgeProps<WorkflowDiagramEdge>;

export const WorkflowDiagramFilteringDisabledEdgeReadonly = ({
  markerStart,
  markerEnd,
  sourceY,
  targetY,
}: WorkflowDiagramFilteringDisabledEdgeReadonlyProps) => {
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
