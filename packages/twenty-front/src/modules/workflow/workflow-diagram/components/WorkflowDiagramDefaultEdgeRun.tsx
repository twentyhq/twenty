import { WorkflowRunDiagramBaseEdge } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramBaseEdge';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { EdgeProps, getBezierPath } from '@xyflow/react';

type WorkflowDiagramDefaultEdgeRunProps = EdgeProps<WorkflowDiagramEdge>;

export const WorkflowDiagramDefaultEdgeRun = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: WorkflowDiagramDefaultEdgeRunProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <WorkflowRunDiagramBaseEdge
      edgePath={edgePath}
      edgeExecutionStatus={data?.edgeExecutionStatus}
    />
  );
};
