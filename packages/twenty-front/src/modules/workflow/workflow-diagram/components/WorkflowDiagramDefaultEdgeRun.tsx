import { WorkflowRunDiagramBaseEdge } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramBaseEdge';
import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { type EdgeProps, getBezierPath } from '@xyflow/react';

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
