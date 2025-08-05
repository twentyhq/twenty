import { getIsInputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsInputTabDisabled';
import { getIsOutputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsOutputTabDisabled';
import { getShouldFocusNodeTab } from '@/command-menu/pages/workflow/step/view-run/utils/getShouldFocusNodeTab';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { WorkflowStepContextProvider } from '@/workflow/states/context/WorkflowStepContext';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { useWorkflowSelectedNodeOrThrow } from '@/workflow/workflow-diagram/hooks/useWorkflowSelectedNodeOrThrow';
import { WorkflowRunStepInputDetail } from '@/workflow/workflow-steps/components/WorkflowRunStepInputDetail';
import { WorkflowRunStepNodeDetail } from '@/workflow/workflow-steps/components/WorkflowRunStepNodeDetail';
import { WorkflowRunStepOutputDetail } from '@/workflow/workflow-steps/components/WorkflowRunStepOutputDetail';
import {
  WorkflowRunTabId,
  WorkflowRunTabIdType,
} from '@/workflow/workflow-steps/types/WorkflowRunTabId';
import { getWorkflowRunStepExecutionStatus } from '@/workflow/workflow-steps/utils/getWorkflowRunStepExecutionStatus';
import styled from '@emotion/styled';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { IconLogin2, IconLogout, IconStepInto } from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledTabList = styled(TabList)`
  background-color: ${({ theme }) => theme.background.secondary};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

type TabId = WorkflowRunTabIdType;

export const CommandMenuWorkflowRunViewStepContent = () => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();
  const workflowRunId = useWorkflowRunIdOrThrow();

  const workflowRun = useWorkflowRun({ workflowRunId });

  const commandMenuPageComponentInstance = useComponentInstanceStateContext(
    CommandMenuPageComponentInstanceContext,
  );
  if (isNull(commandMenuPageComponentInstance)) {
    throw new Error(
      'CommandMenuPageComponentInstanceContext is not defined. This component should be used within CommandMenuPageComponentInstanceContext.',
    );
  }

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    commandMenuPageComponentInstance.instanceId,
  );

  if (!isDefined(workflowRun)) {
    return null;
  }

  const stepExecutionStatus = getWorkflowRunStepExecutionStatus({
    workflowRunState: workflowRun.state,
    stepId: workflowSelectedNode,
  });

  const stepDefinition = getStepDefinitionOrThrow({
    stepId: workflowSelectedNode,
    trigger: flow.trigger,
    steps: flow.steps,
  });

  const shouldFocusNodeTab = getShouldFocusNodeTab({
    stepExecutionStatus,
    actionType:
      stepDefinition?.type === 'action'
        ? stepDefinition.definition.type
        : undefined,
  });
  const isInputTabDisabled = getIsInputTabDisabled({
    stepExecutionStatus,
    workflowSelectedNode,
  });
  const isOutputTabDisabled = getIsOutputTabDisabled({
    stepExecutionStatus,
  });

  const tabs: SingleTabProps<TabId>[] = [
    {
      id: WorkflowRunTabId.OUTPUT,
      title: 'Output',
      Icon: IconLogout,
      disabled: isOutputTabDisabled,
    },
    {
      id: WorkflowRunTabId.NODE,
      title: 'Node',
      Icon: IconStepInto,
    },
    {
      id: WorkflowRunTabId.INPUT,
      title: 'Input',
      Icon: IconLogin2,
      disabled: isInputTabDisabled,
    },
  ];

  return (
    <WorkflowStepContextProvider
      value={{
        workflowVersionId: workflowRun.workflowVersionId,
        workflowRunId: workflowRun.id,
      }}
    >
      <StyledContainer>
        {shouldFocusNodeTab ? (
          <WorkflowRunStepNodeDetail
            stepId={workflowSelectedNode}
            trigger={flow.trigger}
            steps={flow.steps}
            stepExecutionStatus={stepExecutionStatus}
          />
        ) : (
          <>
            <StyledTabList
              tabs={tabs}
              behaveAsLinks={false}
              componentInstanceId={commandMenuPageComponentInstance.instanceId}
            />

            {activeTabId === WorkflowRunTabId.OUTPUT ? (
              <WorkflowRunStepOutputDetail
                key={workflowSelectedNode}
                stepId={workflowSelectedNode}
              />
            ) : null}

            {activeTabId === WorkflowRunTabId.NODE ? (
              <WorkflowRunStepNodeDetail
                stepId={workflowSelectedNode}
                trigger={flow.trigger}
                steps={flow.steps}
                stepExecutionStatus={stepExecutionStatus}
              />
            ) : null}

            {activeTabId === WorkflowRunTabId.INPUT ? (
              <WorkflowRunStepInputDetail
                key={workflowSelectedNode}
                stepId={workflowSelectedNode}
              />
            ) : null}
          </>
        )}
      </StyledContainer>
    </WorkflowStepContextProvider>
  );
};
