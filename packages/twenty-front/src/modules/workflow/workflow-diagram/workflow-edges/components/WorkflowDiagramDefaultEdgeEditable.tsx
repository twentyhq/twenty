import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { WorkflowDiagramBaseEdge } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramBaseEdge';
import { WorkflowDiagramEdgeButtonGroup } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeButtonGroup';
import { WorkflowDiagramEdgeLabel } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabel';
import { WorkflowDiagramEdgeLabelContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeLabelContainer';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { EDGE_BRANCH_ARROW_MARKER } from '@/workflow/workflow-diagram/workflow-edges/constants/EdgeBranchArrowMarker';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { getArrowTipPosition } from '@/workflow/workflow-diagram/workflow-edges/utils/getArrowTipPosition';
import { getConnectionOptionsForSourceHandle } from '@/workflow/workflow-diagram/workflow-edges/utils/getConnectionOptionsForSourceHandle';
import { getEdgePath } from '@/workflow/workflow-diagram/workflow-edges/utils/getEdgePath';
import { useDeleteEdge } from '@/workflow/workflow-steps/hooks/useDeleteEdge';
import { useLingui } from '@lingui/react/macro';
import { EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import { type MouseEvent, useState } from 'react';
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
}: WorkflowDiagramDefaultEdgeEditableProps) => {
  const { i18n } = useLingui();
  const reactflow = useReactFlow();
  const [isArrowHovered, setIsArrowHovered] = useState(false);

  const { isEdgeHovered } = useEdgeState();

  const {
    segments,
    labelPosition: [labelX, labelY],
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

  const arrowTipPosition = getArrowTipPosition({
    targetX,
    targetY,
    targetPosition,
  });

  const handleArrowHover = () => {
    setIsArrowHovered(true);
    reactflow.setEdges((edges) =>
      edges.map((edge) => {
        if (
          edge.source === source &&
          edge.sourceHandle === sourceHandleId &&
          edge.target === target &&
          edge.targetHandle === targetHandleId &&
          edge.markerEnd !== EDGE_BRANCH_ARROW_MARKER.Selected.markerEnd
        ) {
          return {
            ...edge,
            markerEnd: EDGE_BRANCH_ARROW_MARKER.Hover.markerEnd,
          };
        }
        return edge;
      }),
    );
  };

  const handleArrowLeave = () => {
    setIsArrowHovered(false);
    reactflow.setEdges((edges) =>
      edges.map((edge) => {
        if (
          edge.source === source &&
          edge.sourceHandle === sourceHandleId &&
          edge.target === target &&
          edge.targetHandle === targetHandleId &&
          edge.markerEnd === EDGE_BRANCH_ARROW_MARKER.Hover.markerEnd
        ) {
          return {
            ...edge,
            markerEnd: EDGE_BRANCH_ARROW_MARKER.Default.markerEnd,
          };
        }
        return edge;
      }),
    );
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
          >
            <WorkflowDiagramEdgeLabel label={i18n._(data.labelOptions.label)} />
          </WorkflowDiagramEdgeLabelContainer>
        )}

        <WorkflowDiagramEdgeV2Container
          data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
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

      </EdgeLabelRenderer>

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            left: arrowTipPosition.x - 8,
            top: arrowTipPosition.y - 8,
            width: 16,
            height: 16,
            cursor: 'pointer',
            zIndex: 1000,
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            handleArrowHover();
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            handleArrowLeave();
          }}
        />
      </EdgeLabelRenderer>
    </>
  );
};
