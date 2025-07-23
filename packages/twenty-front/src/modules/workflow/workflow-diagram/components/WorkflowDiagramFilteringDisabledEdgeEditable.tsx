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

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
`;

const StyledContainer = styled.div<{
  labelY?: number;
}>`
  position: absolute;
  transform: ${({ labelY }) => `translate(${21}px, ${(labelY || 0) - 14}px)`};
`;

const StyledHoverZone = styled.div`
  position: absolute;
  width: 48px;
  height: 52px;
  transform: translate(-13px, -16px);
  background: transparent;
`;

const StyledWrapper = styled.div`
  pointer-events: all;
  position: relative;
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

  const [edgePath, , labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [hovered, setHovered] = useState(false);

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
        <StyledContainer
          labelY={labelY}
          data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
        >
          <StyledWrapper
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <StyledHoverZone />
            {(hovered || isSelected) && (
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
            )}
          </StyledWrapper>
        </StyledContainer>
      </EdgeLabelRenderer>
    </>
  );
};
