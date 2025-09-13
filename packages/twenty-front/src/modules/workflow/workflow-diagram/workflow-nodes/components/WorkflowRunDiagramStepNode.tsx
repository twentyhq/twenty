import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowRunDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { WorkflowDiagramHandleSource } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleSource';
import { WorkflowDiagramHandleTarget } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleTarget';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeIcon';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeLabelWithCounterPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabelWithCounterPart';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import { WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramNodeDefaultSourceHandleId';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Position } from '@xyflow/react';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { IconCheck, IconX, useIcons } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';

const StyledNodeLabelWithCounterPart = styled(WorkflowNodeLabelWithCounterPart)`
  column-gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledNodeCounter = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-end;
  box-sizing: border-box;
`;

const StyledColorIcon = styled.div<{
  color: string;
}>`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
  background: ${({ color }) => color};
`;

export const WorkflowRunDiagramStepNode = ({
  id,
  data,
  selected,
}: {
  id: string;
  data: WorkflowRunDiagramStepNodeData;
  selected: boolean;
}) => {
  const { getIcon } = useIcons();
  const theme = useTheme();

  const workflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflowRunId = useWorkflowRunIdOrThrow();

  const setWorkflowSelectedNode = useSetRecoilComponentState(
    workflowSelectedNodeComponentState,
  );

  const { openWorkflowRunViewStepInCommandMenu } = useWorkflowCommandMenu();

  const { isInRightDrawer } = useContext(ActionMenuContext);

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const handleClick = () => {
    if (!isDefined(workflowId)) {
      throw new Error('Workflow ID must be defined');
    }

    if (!isInRightDrawer) {
      setCommandMenuNavigationStack([]);
    }

    setWorkflowSelectedNode(id);

    openWorkflowRunViewStepInCommandMenu({
      workflowId,
      workflowRunId,
      title: data.name,
      icon: getIcon(getWorkflowNodeIconKey(data)),
      workflowSelectedNode: id,
      stepExecutionStatus: data.runStatus,
    });
  };

  return (
    <>
      <WorkflowNodeContainer
        data-click-outside-id={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
        runStatus={data.runStatus}
        onClick={handleClick}
      >
        <WorkflowDiagramHandleTarget />
        <WorkflowNodeIconContainer>
          <WorkflowDiagramStepNodeIcon data={data} />
        </WorkflowNodeIconContainer>

        <WorkflowNodeRightPart>
          <StyledNodeLabelWithCounterPart>
            <WorkflowNodeLabel runStatus={data.runStatus}>
              {capitalize(data.nodeType)}
            </WorkflowNodeLabel>

            {data.runStatus === StepStatus.SUCCESS && (
              <StyledNodeCounter>
                <StyledColorIcon color={theme.tag.background.turquoise}>
                  <IconCheck color={theme.tag.text.turquoise} size={14} />
                </StyledColorIcon>
              </StyledNodeCounter>
            )}

            {data.runStatus === StepStatus.FAILED && (
              <StyledNodeCounter>
                <StyledColorIcon color={theme.tag.background.red}>
                  <IconX color={theme.tag.text.red} size={14} />
                </StyledColorIcon>
              </StyledNodeCounter>
            )}

            {(data.runStatus === StepStatus.RUNNING ||
              data.runStatus === StepStatus.PENDING) && (
              <StyledNodeCounter>
                <Loader color="yellow" />
              </StyledNodeCounter>
            )}
          </StyledNodeLabelWithCounterPart>

          <WorkflowNodeTitle runStatus={data.runStatus}>
            {data.name}
          </WorkflowNodeTitle>
        </WorkflowNodeRightPart>
      </WorkflowNodeContainer>

      <WorkflowDiagramHandleSource
        id={WORKFLOW_DIAGRAM_NODE_DEFAULT_SOURCE_HANDLE_ID}
        type="source"
        position={Position.Bottom}
        disableHoverEffect
        selected={selected}
        runStatus={data.runStatus}
      />
    </>
  );
};
