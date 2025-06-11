import { useTheme } from '@emotion/react';
import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react';
import { CREATE_STEP_NODE_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';
import { WorkflowDiagramEdgeOptions } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeOptions';

type WorkflowDiagramDefaultEdgeProps = EdgeProps;

export const WorkflowDiagramDefaultEdge = ({
  source,
  target,
  sourceY,
  targetY,
  markerStart,
  markerEnd,
  data,
}: WorkflowDiagramDefaultEdgeProps) => {
  const theme = useTheme();

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: CREATE_STEP_NODE_WIDTH,
    sourceY,
    targetX: CREATE_STEP_NODE_WIDTH,
    targetY,
  });

  return (
    <>
      <BaseEdge
        markerStart={markerStart}
        markerEnd={markerEnd}
        path={edgePath}
        style={{ stroke: theme.border.color.strong }}
      />
      {data?.shouldDisplayEdgeOptions && (
        <WorkflowDiagramEdgeOptions
          labelX={labelX}
          labelY={labelY}
          parentStepId={source}
          nextStepId={target}
        />
      )}
    </>
  );
};
