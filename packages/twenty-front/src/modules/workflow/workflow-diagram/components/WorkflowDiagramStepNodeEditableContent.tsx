import { WorkflowDiagramCreateStepElement } from '@/workflow/workflow-diagram/components/WorkflowDiagramCreateStepElement';
import { WorkflowDiagramHandleEditable } from '@/workflow/workflow-diagram/components/WorkflowDiagramHandleEditable';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeIcon';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { useEdgeSelected } from '@/workflow/workflow-diagram/hooks/useEdgeSelected';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { type WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';
import styled from '@emotion/styled';
import { Position } from '@xyflow/react';
import { useState } from 'react';
import { capitalize } from 'twenty-shared/utils';
import { IconTrash, Label } from 'twenty-ui/display';
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

const StyledNodeContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 240px;
  min-width: 44px;
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.md};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  background: ${({ theme }) => theme.background.secondary};
  box-sizing: border-box;
  cursor: pointer;
  position: relative;

  &:hover {
    background: linear-gradient(
        0deg,
        ${({ theme }) => theme.background.transparent.lighter} 0%,
        ${({ theme }) => theme.background.transparent.lighter} 100%
      ),
      ${({ theme }) => theme.background.secondary};
  }

  .react-flow__node.selected & {
    border-color: ${({ theme }) => theme.color.blue};
    background: ${({ theme }) => theme.adaptiveColors.blue1};
  }
`;

const StyledNodeIconContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledNodeRightPart = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 184px;
  box-sizing: border-box;
`;

const StyledNodeLabelWithCounterPart = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  height: 14px;
  justify-content: space-between;
  box-sizing: border-box;
`;

const StyledNodeLabel = styled(Label)`
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.tertiary};
  flex: 1 0 0;

  .selectable.selected & {
    color: ${({ theme }) => theme.tag.text.blue};
  }
`;

const StyledNodeTitle = styled.div`
  box-sizing: border-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  align-self: stretch;
  color: ${({ theme }) => theme.font.color.primary};
  display: -webkit-box;
  font-family: Inter;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
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
        <StyledNodeIconContainer>
          <WorkflowDiagramStepNodeIcon data={data} />
        </StyledNodeIconContainer>

        <StyledNodeRightPart>
          <StyledNodeLabelWithCounterPart>
            <StyledNodeLabel>{capitalize(data.nodeType)}</StyledNodeLabel>
          </StyledNodeLabelWithCounterPart>

          <StyledNodeTitle>{data.name}</StyledNodeTitle>
        </StyledNodeRightPart>

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
