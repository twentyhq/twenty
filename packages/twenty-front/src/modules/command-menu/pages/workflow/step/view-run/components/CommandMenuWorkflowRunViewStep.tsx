import { SingleTabProps, TabList } from '@/ui/layout/tab/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { ActiveTabComponentInstanceContext } from '@/ui/layout/tab/states/contexts/ActiveTabComponentInstanceContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { WorkflowStepContextProvider } from '@/workflow/states/context/WorkflowStepContext';
import { useWorkflowSelectedNodeOrThrow } from '@/workflow/workflow-diagram/hooks/useWorkflowSelectedNodeOrThrow';
import { WorkflowRunStepInputDetail } from '@/workflow/workflow-steps/components/WorkflowRunStepInputDetail';
import { WorkflowRunStepOutputDetail } from '@/workflow/workflow-steps/components/WorkflowRunStepOutputDetail';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import { getWorkflowRunStepExecutionStatus } from '@/workflow/workflow-steps/utils/getWorkflowRunStepExecutionStatus';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared';
import { IconLogin2, IconLogout, IconStepInto } from 'twenty-ui';

const StyledTabList = styled(TabList)`
  background-color: ${({ theme }) => theme.background.secondary};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

type TabId = 'node' | 'input' | 'output';

export const CommandMenuWorkflowRunViewStep = () => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();
  const workflowRunId = useWorkflowRunIdOrThrow();

  const workflowRun = useWorkflowRun({ workflowRunId });

  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    'command-menu-workflow-run-view-step',
  );

  const stepExecutionStatus = isDefined(workflowRun)
    ? getWorkflowRunStepExecutionStatus({
        workflowRunOutput: workflowRun.output,
        stepId: workflowSelectedNode,
      })
    : undefined;

  const areInputAndOutputTabsDisabled =
    workflowSelectedNode === TRIGGER_STEP_ID ||
    stepExecutionStatus === 'running' ||
    stepExecutionStatus === 'not-executed';

  const tabs: SingleTabProps<TabId>[] = [
    { id: 'node', title: 'Node', Icon: IconStepInto },
    {
      id: 'input',
      title: 'Input',
      Icon: IconLogin2,
      disabled: areInputAndOutputTabsDisabled,
    },
    {
      id: 'output',
      title: 'Output',
      Icon: IconLogout,
      disabled: areInputAndOutputTabsDisabled,
    },
  ];

  if (!isDefined(workflowRun)) {
    return null;
  }

  return (
    <ActiveTabComponentInstanceContext.Provider
      value={{ instanceId: 'command-menu-workflow-run-view-step' }}
    >
      <WorkflowStepContextProvider
        value={{ workflowVersionId: workflowRun.workflowVersionId }}
      >
        <StyledTabList tabs={tabs} behaveAsLinks={false} />

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

        {activeTabId === 'output' ? (
          <WorkflowRunStepOutputDetail stepId={workflowSelectedNode} />
        ) : null}
      </WorkflowStepContextProvider>
    </ActiveTabComponentInstanceContext.Provider>
  );
};
