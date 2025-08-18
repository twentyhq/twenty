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
import { WorkflowDiagramHandleReadonly } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramHandleReadonly';
import { WorkflowDiagramStepNodeIcon } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowDiagramStepNodeIcon';
import { WorkflowNodeContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeContainer';
import { WorkflowNodeIconContainer } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeIconContainer';
import { WorkflowNodeLabel } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabel';
import { WorkflowNodeLabelWithCounterPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeLabelWithCounterPart';
import { WorkflowNodeRightPart } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeRightPart';
import { WorkflowNodeTitle } from '@/workflow/workflow-diagram/workflow-nodes/components/WorkflowNodeTitle';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Position } from '@xyflow/react';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { IconCheck, IconX, useIcons } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';

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

  .selected &[data-status='RUNNING'],
  .selected &[data-status='PENDING'] {
    border-color: ${({ theme }) => theme.color.yellow};
    background: ${({ theme }) => theme.adaptiveColors.yellow1};
  }

  .selected &[data-status='FAILED'] {
    border-color: ${({ theme }) => theme.color.red};
    background: ${({ theme }) => theme.adaptiveColors.red1};
  }

  .selected &[data-status='SUCCESS'] {
    border-color: ${({ theme }) => theme.color.turquoise};
    background: ${({ theme }) => theme.adaptiveColors.turquoise1};
  }
`;

const StyledNodeLabelWithCounterPart = styled(WorkflowNodeLabelWithCounterPart)`
  column-gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledNodeLabel = styled(WorkflowNodeLabel)`
  color: ${({ theme }) => theme.font.color.tertiary};

  .selected & {
    color: ${({ theme }) => theme.tag.text.blue};
  }

  &[data-status='RUNNING'],
  &[data-status='PENDING'] {
    color: ${({ theme }) => theme.tag.text.yellow};
  }

  &[data-status='FAILED'] {
    color: ${({ theme }) => theme.tag.text.red};
  }

  &[data-status='SUCCESS'] {
    color: ${({ theme }) => theme.tag.text.green};
  }
`;

const StyledNodeTitle = styled(WorkflowNodeTitle)`
  color: ${({ theme }) => theme.font.color.light};

  &[data-status='RUNNING'],
  &[data-status='PENDING'],
  &[data-status='FAILED'],
  &[data-status='SUCCESS'],
  .selected & {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledNodeCounter = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: flex-end;
  box-sizing: border-box;
`;

const StyledColorIcon = styled.div`
  display: flex;
  width: 14px;
  height: 14px;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.border.radius.sm};

  &[data-status='FAILED'] {
    background: ${({ theme }) => theme.tag.background.red};
  }

  &[data-status='SUCCESS'] {
    background: ${({ theme }) => theme.tag.background.turquoise};
  }
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
      {data.nodeType !== 'trigger' && (
        <WorkflowDiagramHandleReadonly
          type="target"
          position={Position.Top}
          selected={false}
        />
      )}

      <StyledNodeContainer
        data-click-outside-id={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
        data-status={data.runStatus}
        onClick={handleClick}
      >
        <WorkflowNodeIconContainer>
          <WorkflowDiagramStepNodeIcon data={data} />
        </WorkflowNodeIconContainer>

        <WorkflowNodeRightPart>
          <StyledNodeLabelWithCounterPart>
            <StyledNodeLabel data-status={data.runStatus}>
              {capitalize(data.nodeType)}
            </StyledNodeLabel>

            {data.runStatus === StepStatus.SUCCESS && (
              <StyledNodeCounter>
                <StyledColorIcon data-status={StepStatus.SUCCESS}>
                  <IconCheck color={theme.tag.text.turquoise} size={14} />
                </StyledColorIcon>
              </StyledNodeCounter>
            )}

            {data.runStatus === StepStatus.FAILED && (
              <StyledNodeCounter>
                <StyledColorIcon data-status={StepStatus.FAILED}>
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

          <StyledNodeTitle data-status={data.runStatus}>
            {data.name}
          </StyledNodeTitle>
        </WorkflowNodeRightPart>
      </StyledNodeContainer>

      <WorkflowDiagramHandleReadonly
        type="source"
        position={Position.Bottom}
        selected={selected}
      />
    </>
  );
};
