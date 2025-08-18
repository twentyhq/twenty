import { WorkflowDiagramCreateStepElement } from '@/workflow/workflow-diagram/components/WorkflowDiagramCreateStepElement';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { useEdgeSelected } from '@/workflow/workflow-diagram/hooks/useEdgeSelected';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { type WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';
import { WorkflowDiagramHandleEditable } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleEditable';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeIcon';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeLabelWithCounterPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabelWithCounterPart';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import styled from '@emotion/styled';
import { Position } from '@xyflow/react';
import { useState } from 'react';
import { capitalize } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/display';
import { FloatingIconButton } from 'twenty-ui/input';

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

const StyledNodeContainer = styled(WorkflowNodeContainer)`
  border-color: ${({ theme }) => theme.border.color.strong};
  background: ${({ theme }) => theme.background.secondary};

  &:hover {
    background: linear-gradient(
        0deg,
        ${({ theme }) => theme.background.transparent.lighter} 0%,
        ${({ theme }) => theme.background.transparent.lighter} 100%
      ),
      ${({ theme }) => theme.background.secondary};
  }

  .selected & {
    border-color: ${({ theme }) => theme.color.blue};
    background: ${({ theme }) => theme.adaptiveColors.blue1};
  }
`;

const StyledNodeLabel = styled(WorkflowNodeLabel)`
  color: ${({ theme }) => theme.font.color.tertiary};

  .selected & {
    color: ${({ theme }) => theme.tag.text.blue};
  }
`;

const StyledNodeTitle = styled(WorkflowNodeTitle)`
  color: ${({ theme }) => theme.font.color.primary};
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
  variant: WorkflowDiagramNodeVariant;
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

  const { getNodeHandlesSelectedState } = useEdgeSelected();

  const handlesSelectedState = getNodeHandlesSelectedState(id);

  return (
    <>
      {data.nodeType !== 'trigger' && (
        <WorkflowDiagramHandleEditable
          type="target"
          position={Position.Top}
          selected={handlesSelectedState.targetHandle}
        />
      )}

      <StyledNodeContainer
        data-click-outside-id={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <WorkflowNodeIconContainer>
          <WorkflowDiagramStepNodeIcon data={data} />
        </WorkflowNodeIconContainer>

        <WorkflowNodeRightPart>
          <WorkflowNodeLabelWithCounterPart>
            <StyledNodeLabel>{capitalize(data.nodeType)}</StyledNodeLabel>
          </WorkflowNodeLabelWithCounterPart>

          <StyledNodeTitle>{data.name}</StyledNodeTitle>
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
      </StyledNodeContainer>

      {!data.hasNextStepIds && (
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

      <WorkflowDiagramHandleEditable
        type="source"
        position={Position.Bottom}
        selected={handlesSelectedState.sourceHandle || selected}
      />
    </>
  );
};
