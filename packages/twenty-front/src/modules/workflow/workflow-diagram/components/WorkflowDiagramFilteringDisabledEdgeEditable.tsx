import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { useState } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2VisibilityContainer';

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
`;

type WorkflowDiagramFilteringDisabledEdgeEditableProps =
  EdgeProps<WorkflowDiagramEdge>;

export const WorkflowDiagramFilteringDisabledEdgeEditable = ({
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

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const { startNodeCreation } = useStartNodeCreation();

  const workflowInsertStepIds = useRecoilComponentValueV2(
    workflowInsertStepIdsComponentState,
  );

  const isSelected =
    workflowInsertStepIds.parentStepId === source &&
    workflowInsertStepIds.nextStepId === target;

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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <WorkflowDiagramEdgeV2VisibilityContainer
            shouldDisplay={hovered || isSelected}
          >
            <StyledIconButtonGroup
              className="nodrag nopan"
              iconButtons={[
                {
                  Icon: IconPlus,
                  onClick: () => {
                    startNodeCreation({
                      parentStepId: source,
                      nextStepId: target,
                    });
                  },
                },
              ]}
            />
          </WorkflowDiagramEdgeV2VisibilityContainer>
        </WorkflowDiagramEdgeV2Container>
      </EdgeLabelRenderer>
    </>
  );
};
