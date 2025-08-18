import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowDiagramHandleReadonly } from '@/workflow/workflow-diagram/components/WorkflowDiagramHandleReadonly';
import { WorkflowDiagramStepNodeBigIcon } from '@/workflow/workflow-diagram/components/WorkflowDiagramStepNodeBigIcon';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowRunDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowNodeIconKey } from '@/workflow/workflow-diagram/utils/getWorkflowNodeIconKey';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Position } from '@xyflow/react';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { IconCheck, IconX, Label, useIcons } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';

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
  column-gap: ${({ theme }) => theme.spacing(2)};
  height: 14px;
  justify-content: space-between;
  box-sizing: border-box;
`;

const StyledNodeLabel = styled(Label)`
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.tertiary};
  flex: 1 0 0;

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

const StyledNodeTitle = styled.div`
  box-sizing: border-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  align-self: stretch;
  color: ${({ theme }) => theme.font.color.light};
  display: -webkit-box;
  font-family: Inter;
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;

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
  gap: 4px;
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
        <StyledNodeIconContainer>
          <WorkflowDiagramStepNodeBigIcon data={data} />
        </StyledNodeIconContainer>

        <StyledNodeRightPart>
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
