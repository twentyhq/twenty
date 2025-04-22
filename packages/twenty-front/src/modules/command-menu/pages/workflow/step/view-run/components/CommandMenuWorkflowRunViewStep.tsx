import { getIsInputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsInputTabDisabled';
import { getIsOutputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsOutputTabDisabled';
import { SingleTabProps, TabList } from '@/ui/layout/tab/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { WorkflowStepContextProvider } from '@/workflow/states/context/WorkflowStepContext';
import { useWorkflowSelectedNodeOrThrow } from '@/workflow/workflow-diagram/hooks/useWorkflowSelectedNodeOrThrow';
import { WorkflowRunStepInputDetail } from '@/workflow/workflow-steps/components/WorkflowRunStepInputDetail';
import { WorkflowRunStepNodeDetail } from '@/workflow/workflow-steps/components/WorkflowRunStepNodeDetail';
import { WorkflowRunStepOutputDetail } from '@/workflow/workflow-steps/components/WorkflowRunStepOutputDetail';
import { WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/constants/WorkflowRunStepSidePanelTabListComponentId';
import {
  WorkflowRunTabId,
  WorkflowRunTabIdType,
} from '@/workflow/workflow-steps/types/WorkflowRunTabId';
import { getWorkflowRunStepExecutionStatus } from '@/workflow/workflow-steps/utils/getWorkflowRunStepExecutionStatus';
import styled from '@emotion/styled';
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

export const CommandMenuWorkflowRunViewStep = () => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();
  const workflowRunId = useWorkflowRunIdOrThrow();

  const workflowRun = useWorkflowRun({ workflowRunId });

  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID,
  );

  if (!isDefined(workflowRun)) {
    return null;
  }

  const stepExecutionStatus = getWorkflowRunStepExecutionStatus({
    workflowRunOutput: workflowRun.output,
    stepId: workflowSelectedNode,
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
    { id: WorkflowRunTabId.NODE, title: 'Node', Icon: IconStepInto },
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
        <StyledTabList
          tabs={tabs}
          behaveAsLinks={false}
          componentInstanceId={
            WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID
          }
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
      </StyledContainer>
    </WorkflowStepContextProvider>
  );
};
