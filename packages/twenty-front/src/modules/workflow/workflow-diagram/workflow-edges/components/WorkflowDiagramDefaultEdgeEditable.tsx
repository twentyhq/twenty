import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { WorkflowDiagramBaseEdge } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramBaseEdge';
import { WorkflowDiagramEdgeButtonGroup } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeButtonGroup';
import { WorkflowDiagramEdgeLabel } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabel';
import { WorkflowDiagramEdgeLabelContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabelContainer';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { getConnectionOptionsForSourceHandle } from '@/workflow/workflow-diagram/workflow-edges/utils/getConnectionOptionsForSourceHandle';
import { getEdgePath } from '@/workflow/workflow-diagram/workflow-edges/utils/getEdgePath';
import { useDeleteEdge } from '@/workflow/workflow-steps/hooks/useDeleteEdge';
import { useLingui } from '@lingui/react/macro';
import { EdgeLabelRenderer } from '@xyflow/react';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus, IconTrash } from 'twenty-ui/display';

type WorkflowDiagramDefaultEdgeEditableProps =
  WorkflowDiagramEdgeComponentProps;

export const WorkflowDiagramDefaultEdgeEditable = ({
  source,
  sourceHandleId,
  sourcePosition,
  target,
  targetHandleId,
  targetPosition,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerStart,
  markerEnd,
  data,
  deletable,
}: WorkflowDiagramDefaultEdgeEditableProps) => {
  const { i18n } = useLingui();

  const { isEdgeHovered } = useEdgeState();

  const isEditable = deletable !== false;

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

  const { deleteEdge } = useDeleteEdge();

  const { startNodeCreation, isNodeCreationStarted } = useStartNodeCreation();

  const nodeCreationStarted = isNodeCreationStarted({
    parentStepId: source,
    nextStepId: target,
  });

  const handleNodeButtonClick = () => {
    startNodeCreation({
      parentStepId: source,
      nextStepId: target,
      position: { x: labelX, y: labelY },
      connectionOptions: getConnectionOptionsForSourceHandle({
        sourceHandleId,
      }),
    });
  };

  const handleDeleteBranch = async (event: MouseEvent) => {
    event.stopPropagation();

    await deleteEdge({
      source,
      target,
      sourceConnectionOptions: getConnectionOptionsForSourceHandle({
        sourceHandleId,
      }),
    });
  };

  return (
    <>
      {segments.map((segment) => (
        <WorkflowDiagramBaseEdge
          key={segment.path}
          source={source}
          sourceHandleId={sourceHandleId}
          target={target}
          targetHandleId={targetHandleId}
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
            centerX={labelX}
            centerY={labelY}
          >
            <WorkflowDiagramEdgeLabel label={i18n._(data.labelOptions.label)} />
          </WorkflowDiagramEdgeLabelContainer>
        )}

        {isEditable && (
          <WorkflowDiagramEdgeV2Container
            data-click-outside-id={
              WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID
            }
            labelX={labelX}
            labelY={labelY}
          >
            <WorkflowDiagramEdgeV2VisibilityContainer
              shouldDisplay={
                nodeCreationStarted ||
                isEdgeHovered({
                  source,
                  target,
                  sourceHandle: sourceHandleId,
                  targetHandle: targetHandleId,
                })
              }
            >
              <WorkflowDiagramEdgeButtonGroup
                iconButtons={[
                  {
                    Icon: IconPlus,
                    onClick: handleNodeButtonClick,
                  },
                  {
                    Icon: IconTrash,
                    onClick: handleDeleteBranch,
                  },
                ]}
                selected={nodeCreationStarted}
              />
            </WorkflowDiagramEdgeV2VisibilityContainer>
          </WorkflowDiagramEdgeV2Container>
        )}
      </EdgeLabelRenderer>
    </>
  );
};
