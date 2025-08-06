import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { IconPlus } from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { useIsEdgeHovered } from '@/workflow/workflow-diagram/hooks/useIsEdgeHovered';

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
`;

type WorkflowDiagramFilteringDisabledEdgeEditableProps =
  EdgeProps<WorkflowDiagramEdge>;

export const WorkflowDiagramFilteringDisabledEdgeEditable = ({
  id,
  markerStart,
  markerEnd,
  source,
  sourceY,
  sourceX,
  target,
  targetX,
  targetY,
}: WorkflowDiagramFilteringDisabledEdgeEditableProps) => {
  const theme = useTheme();

  const { isEdgeHovered } = useIsEdgeHovered();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { startNodeCreation, isNodeCreationStarted } = useStartNodeCreation();

  const forceDisplayAddButton = isNodeCreationStarted({
    parentStepId: source,
    nextStepId: target,
  });

  const handleAddNodeButtonClick = () => {
    startNodeCreation({
      parentStepId: source,
      nextStepId: target,
      position: { x: labelX, y: labelY },
    });
  };

  return (
    <>
      <BaseEdge
        markerStart={markerStart}
        markerEnd={markerEnd}
        path={edgePath}
        style={{ stroke: theme.border.color.strong }}
      />

      <EdgeLabelRenderer>
        <WorkflowDiagramEdgeV2Container
          data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
          labelX={labelX}
          labelY={labelY}
        >
          <WorkflowDiagramEdgeV2VisibilityContainer
            shouldDisplay={isEdgeHovered(id) || forceDisplayAddButton}
          >
            <StyledIconButtonGroup
              className="nodrag nopan"
              iconButtons={[
                {
                  Icon: IconPlus,
                  onClick: handleAddNodeButtonClick,
                },
              ]}
            />
          </WorkflowDiagramEdgeV2VisibilityContainer>
        </WorkflowDiagramEdgeV2Container>
      </EdgeLabelRenderer>
    </>
  );
};
