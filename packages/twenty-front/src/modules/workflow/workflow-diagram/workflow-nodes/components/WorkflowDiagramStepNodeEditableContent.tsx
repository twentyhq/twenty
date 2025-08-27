import { WorkflowDiagramCreateStepElement } from '@/workflow/workflow-diagram/components/WorkflowDiagramCreateStepElement';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { useEdgeState } from '@/workflow/workflow-diagram/workflow-edges/hooks/useEdgeState';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeIcon';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeLabelWithCounterPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabelWithCounterPart';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import styled from '@emotion/styled';
import { useState } from 'react';
import { capitalize } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/display';
import { FloatingIconButton } from 'twenty-ui/input';
import { useConnectionState } from '@/workflow/workflow-diagram/workflow-nodes/hooks/useConnectionState';
import { WorkflowDiagramHandleTarget } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleTarget';
import { WorkflowDiagramHandleSource } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleSource';

const StyledAddStepButtonContainer = styled.div<{
  shouldDisplay: boolean;
}>`
  display: flex;
  align-items: center;
  position: absolute;
  justify-content: center;
  flex-direction: column;
  opacity: ${({ shouldDisplay }) => (shouldDisplay ? 1 : 0)};
  left: 50%;
  bottom: 0;
  transform: translateX(-50%) translateY(100%);
`;

const StyledDeleteButtonContainer = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  right: ${({ theme }) => theme.spacing(-4)};
  bottom: 0;
  top: 0;
  transform: translateX(100%);
`;

export const WorkflowDiagramStepNodeEditableContent = ({
  id,
  data,
  selected,
  onClick,
  onDelete,
}: {
  id: string;
  data: WorkflowDiagramStepNodeData;
  selected: boolean;
  onDelete: () => void;
  onClick?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const { isNodeCreationStarted } = useStartNodeCreation();

  const { isConnectable, isSourceConnected, isInProgressConnection } =
    useConnectionState(data.nodeType);

  const { isSourceSelected, isSourceHovered } = useEdgeState();

  return (
    <>
      <WorkflowNodeContainer
        data-click-outside-id={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        isConnectable={isConnectable(id)}
      >
        <WorkflowDiagramHandleTarget isConnectable={isConnectable(id)} />
        <WorkflowNodeIconContainer>
          <WorkflowDiagramStepNodeIcon data={data} />
        </WorkflowNodeIconContainer>

        <WorkflowNodeRightPart>
          <WorkflowNodeLabelWithCounterPart>
            <WorkflowNodeLabel>{capitalize(data.nodeType)}</WorkflowNodeLabel>
          </WorkflowNodeLabelWithCounterPart>

          <WorkflowNodeTitle highlight>{data.name}</WorkflowNodeTitle>
        </WorkflowNodeRightPart>

        {selected && (
          <StyledDeleteButtonContainer>
            <FloatingIconButton
              size="medium"
              Icon={IconTrash}
              onClick={onDelete}
            />
          </StyledDeleteButtonContainer>
        )}
      </WorkflowNodeContainer>

      {!data.hasNextStepIds && !isInProgressConnection && (
        <StyledAddStepButtonContainer
          shouldDisplay={
            isHovered ||
            selected ||
            isNodeCreationStarted({ parentStepId: data.stepId })
          }
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <WorkflowDiagramCreateStepElement data={data} />
        </StyledAddStepButtonContainer>
      )}

      <WorkflowDiagramHandleSource
        selected={
          isSourceSelected(id) ||
          selected ||
          isSourceConnected(id) ||
          (isConnectable(id) && isHovered)
        }
        hovered={isSourceHovered(id) || isHovered}
      />
    </>
  );
};
