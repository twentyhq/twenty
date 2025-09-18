import { WorkflowRunDiagramBaseEdge } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowRunDiagramBaseEdge';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { getEdgePath } from '@/workflow/workflow-diagram/workflow-edges/utils/getEdgePath';

type WorkflowDiagramDefaultEdgeRunProps = WorkflowDiagramEdgeComponentProps;

export const WorkflowDiagramDefaultEdgeRun = ({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerStart,
  markerEnd,
  data,
}: WorkflowDiagramDefaultEdgeRunProps) => {
  const { segments } = getEdgePath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    markerStart,
    markerEnd,
    strategy: data?.edgePathStrategy,
  });

  return (
    <>
      {segments.map((segment) => (
        <WorkflowRunDiagramBaseEdge
          key={segment.path}
          path={segment.path}
          markerStart={segment.markerStart}
          markerEnd={segment.markerEnd}
        />
      ))}
    </>
  );
};
