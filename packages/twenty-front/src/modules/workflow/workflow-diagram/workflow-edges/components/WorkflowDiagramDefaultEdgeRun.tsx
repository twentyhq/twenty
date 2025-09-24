import { WorkflowDiagramEdgeLabel } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabel';
import { WorkflowDiagramEdgeLabelContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabelContainer';
import { WorkflowRunDiagramBaseEdge } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowRunDiagramBaseEdge';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { getEdgePath } from '@/workflow/workflow-diagram/workflow-edges/utils/getEdgePath';
import { useLingui } from '@lingui/react/macro';
import { EdgeLabelRenderer } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';

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
  const { i18n } = useLingui();

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

      <EdgeLabelRenderer>
        {isDefined(data?.labelOptions) && (
          <WorkflowDiagramEdgeLabelContainer
            sourceX={sourceX}
            sourceY={sourceY}
            position={data.labelOptions.position}
          >
            <WorkflowDiagramEdgeLabel label={i18n._(data.labelOptions.label)} />
          </WorkflowDiagramEdgeLabelContainer>
        )}
      </EdgeLabelRenderer>
    </>
  );
};
