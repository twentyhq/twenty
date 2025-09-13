import { WorkflowRunDiagramBaseEdge } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowRunDiagramBaseEdge';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { getBezierPath } from '@xyflow/react';

type WorkflowDiagramDefaultEdgeRunProps = WorkflowDiagramEdgeComponentProps;

export const WorkflowDiagramDefaultEdgeRun = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerStart,
  markerEnd,
}: WorkflowDiagramDefaultEdgeRunProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <WorkflowRunDiagramBaseEdge
      path={edgePath}
      markerStart={markerStart}
      markerEnd={markerEnd}
    />
  );
};
