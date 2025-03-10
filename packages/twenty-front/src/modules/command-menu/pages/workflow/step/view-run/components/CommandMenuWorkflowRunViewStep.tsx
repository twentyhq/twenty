import { ShowPageSubContainerTabListContainer } from '@/ui/layout/show-page/components/ShowPageSubContainerTabListContainer';
import { SingleTabProps, TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { useWorkflowSelectedNodeOrThrow } from '@/workflow/workflow-diagram/hooks/useWorkflowSelectedNodeOrThrow';
import { WorkflowRunStepInputDetail } from '@/workflow/workflow-steps/components/WorkflowRunStepInputDetail';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import { WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/constants/WorkflowRunStepSidePanelTabListComponentId';
import { getWorkflowRunStepExecutionStatus } from '@/workflow/workflow-steps/utils/getWorkflowRunStepExecutionStatus';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';
import { IconLogin2, IconLogout, IconStepInto } from 'twenty-ui';

const StyledTabListContainer = styled(ShowPageSubContainerTabListContainer)`
  background-color: ${({ theme }) => theme.background.secondary};
`;

type TabId = 'node' | 'input' | 'output';

export const CommandMenuWorkflowRunViewStep = () => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();
  const workflowRunId = useWorkflowRunIdOrThrow();

  const workflowRun = useWorkflowRun({ workflowRunId });

  const { activeTabId } = useTabList<TabId>(
    WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID,
  );

  const stepExecutionStatus = isDefined(workflowRun)
    ? getWorkflowRunStepExecutionStatus({
        workflowRunOutput: workflowRun.output,
        stepId: workflowSelectedNode,
      })
    : undefined;

  const isInputTabDisabled =
    workflowSelectedNode === TRIGGER_STEP_ID ||
    stepExecutionStatus === 'running' ||
    stepExecutionStatus === 'not-executed';

  const tabs: SingleTabProps<TabId>[] = [
    { id: 'node', title: 'Node', Icon: IconStepInto },
    {
      id: 'input',
      title: 'Input',
      Icon: IconLogin2,
      disabled: isInputTabDisabled,
    },
    { id: 'output', title: 'Output', Icon: IconLogout },
  ];

  if (!isDefined(workflowRun)) {
    return null;
  }

  return (
    <>
      <StyledTabListContainer>
        <TabList
          tabListInstanceId={WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID}
          tabs={tabs}
          behaveAsLinks={false}
        />
      </StyledTabListContainer>

      {activeTabId === 'node' ? (
        <WorkflowStepDetail
          readonly
          stepId={workflowSelectedNode}
          trigger={flow.trigger}
          steps={flow.steps}
        />
      ) : null}

      {activeTabId === 'input' ? (
        <WorkflowRunStepInputDetail stepId={workflowSelectedNode} />
      ) : null}
    </>
  );
};
