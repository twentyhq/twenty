import { WorkflowRunDiagramBaseEdge } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramBaseEdge';
import { CREATE_STEP_NODE_WIDTH } from '@/workflow/workflow-diagram/constants/CreateStepNodeWidth';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { EdgeProps, getStraightPath } from '@xyflow/react';

type WorkflowDiagramDefaultEdgeRunProps = EdgeProps<WorkflowDiagramEdge>;

export const WorkflowDiagramDefaultEdgeRun = ({
  sourceY,
  targetY,
  data,
}: WorkflowDiagramDefaultEdgeRunProps) => {
  const [edgePath] = getStraightPath({
    sourceX: CREATE_STEP_NODE_WIDTH,
    sourceY,
    targetX: CREATE_STEP_NODE_WIDTH,
    targetY,
  });

  return (
    <WorkflowRunDiagramBaseEdge
      edgePath={edgePath}
      edgeExecutionStatus={data?.edgeExecutionStatus}
    />
  );
};
