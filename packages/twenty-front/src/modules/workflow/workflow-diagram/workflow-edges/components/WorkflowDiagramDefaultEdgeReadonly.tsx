import { WorkflowDiagramEdgeLabel } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabel';
import { WorkflowDiagramEdgeLabelContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabelContainer';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { getEdgePath } from '@/workflow/workflow-diagram/workflow-edges/utils/getEdgePath';
import { useTheme } from '@emotion/react';
import { i18n } from '@lingui/core';
import { BaseEdge, EdgeLabelRenderer } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';

type WorkflowDiagramDefaultEdgeReadonlyProps =
  WorkflowDiagramEdgeComponentProps;

export const WorkflowDiagramDefaultEdgeReadonly = ({
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerStart,
  markerEnd,
  data,
}: WorkflowDiagramDefaultEdgeReadonlyProps) => {
  const theme = useTheme();

  const {
    segments,
    overlayPosition: [labelX, labelY],
  } = getEdgePath({
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
        <BaseEdge
          key={segment.path}
          markerStart={segment.markerStart}
          markerEnd={segment.markerEnd}
          path={segment.path}
          style={{ stroke: theme.border.color.strong }}
        />
      ))}

      <EdgeLabelRenderer>
        {isDefined(data?.labelOptions) && (
          <WorkflowDiagramEdgeLabelContainer
            sourceX={sourceX}
            sourceY={sourceY}
            position={data.labelOptions.position}
            centerX={labelX}
            centerY={labelY}
          >
            <WorkflowDiagramEdgeLabel label={i18n._(data.labelOptions.label)} />
          </WorkflowDiagramEdgeLabelContainer>
        )}
      </EdgeLabelRenderer>
    </>
  );
};
