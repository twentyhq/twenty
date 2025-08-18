import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { workflowVisualizerWorkflowVersionIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowVersionIdComponentState';
import { WorkflowDiagramHandleReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramHandleReadonly';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeIcon';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/WorkflowNodeContainer';
import styled from '@emotion/styled';
import { Position } from '@xyflow/react';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { Label, useIcons } from 'twenty-ui/display';

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

export const WorkflowDiagramStepNodeReadonly = ({
  id,
  selected,
  data,
}: {
  id: string;
  selected: boolean;
  data: WorkflowDiagramStepNodeData;
}) => {
  const { getIcon } = useIcons();

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowVisualizerWorkflowVersionId = useRecoilComponentValue(
    workflowVisualizerWorkflowVersionIdComponentState,
  );

  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );

  const { openWorkflowViewStepInCommandMenu } = useWorkflowCommandMenu();

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const handleClick = () => {
    if (
      !isDefined(workflowVisualizerWorkflowId) ||
      !isDefined(workflowVisualizerWorkflowVersionId)
    ) {
      throw new Error('Workflow ID and Version ID must be defined');
    }

    if (!isInRightDrawer) {
      setCommandMenuNavigationStack([]);
    }

    setWorkflowSelectedNode(id);

    openWorkflowViewStepInCommandMenu({
      workflowId: workflowVisualizerWorkflowId,
      workflowVersionId: workflowVisualizerWorkflowVersionId,
      title: data.name,
      icon: getIcon(getWorkflowNodeIconKey(data)),
    });
  };

  return (
    <>
      {data.nodeType !== 'trigger' && (
        <WorkflowDiagramHandleReadonly
          type="target"
          position={Position.Top}
          selected={false}
        />
      )}

      <StyledNodeContainer
        data-click-outside-id={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
        onClick={handleClick}
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
      </StyledNodeContainer>

      <WorkflowDiagramHandleReadonly
        type="source"
        position={Position.Bottom}
        selected={selected}
      />
    </>
  );
};
