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
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeIcon';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeLabelWithCounterPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabelWithCounterPart';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { IconCheck, IconX, useIcons } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { WorkflowDiagramHandleTarget } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleTarget';
import { WorkflowDiagramHandleSource } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleSource';
import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';

const StyledNodeContainer = styled(WorkflowNodeContainer)<{
  runStatus?: WorkflowRunStepStatus;
}>`
  &:hover {
    background: linear-gradient(
        0deg,
        ${({ theme }) => theme.background.transparent.lighter} 0%,
        ${({ theme }) => theme.background.transparent.lighter} 100%
      ),
      ${({ theme }) => theme.background.secondary};
  }

  ${({ theme, runStatus }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });

    return css`
      border-color: ${colors.unselected.borderColor};
      background: ${colors.unselected.background};

      .selected & {
        background-color: ${colors.selected.background};
        border: 1px solid ${colors.selected.borderColor};
      }
    `;
  }}
`;

const StyledNodeLabelWithCounterPart = styled(WorkflowNodeLabelWithCounterPart)`
  column-gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledNodeLabel = styled(WorkflowNodeLabel)<{
  runStatus?: WorkflowRunStepStatus;
}>`
  ${({ theme, runStatus }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });

    return css`
      color: ${colors.unselected.color};

      .selected & {
        color: ${colors.selected.color};
      }
    `;
  }}
`;

const StyledNodeTitle = styled(WorkflowNodeTitle)<{
  runStatus?: WorkflowRunStepStatus;
}>`
  ${({ theme, runStatus }) => {
    const colors = getWorkflowDiagramColors({ theme, runStatus });

    return css`
      color: ${colors.unselected.titleColor};

      .selected & {
        color: ${colors.selected.titleColor};
      }
    `;
  }}
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
      <StyledNodeContainer
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
            <StyledNodeLabel runStatus={data.runStatus}>
              {capitalize(data.nodeType)}
            </StyledNodeLabel>

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

          <StyledNodeTitle runStatus={data.runStatus}>
            {data.name}
          </StyledNodeTitle>
        </WorkflowNodeRightPart>
      </StyledNodeContainer>

      <WorkflowDiagramHandleSource
        runStatus={data.runStatus}
        selected={selected}
        readOnly
      />
    </>
  );
};
