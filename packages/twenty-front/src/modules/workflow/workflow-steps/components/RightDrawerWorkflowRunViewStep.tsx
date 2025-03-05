import { ShowPageSubContainerTabListContainer } from '@/ui/layout/show-page/components/ShowPageSubContainerTabListContainer';
import { SingleTabProps, TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useWorkflowSelectedNodeOrThrow } from '@/workflow/workflow-diagram/hooks/useWorkflowSelectedNodeOrThrow';
import { WorkflowRunStepInputDetail } from '@/workflow/workflow-steps/components/WorkflowRunStepInputDetail';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import { WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/constants/WorkflowRunStepSidePanelTabListComponentId';
import { TRIGGER_STEP_ID } from '@/workflow/workflow-trigger/constants/TriggerStepId';
import styled from '@emotion/styled';
import { IconLogin2, IconLogout, IconStepInto } from 'twenty-ui';

const StyledTabListContainer = styled(ShowPageSubContainerTabListContainer)`
  background-color: ${({ theme }) => theme.background.secondary};
`;

type TabId = 'node' | 'input' | 'output';

export const RightDrawerWorkflowRunViewStep = () => {
  const flow = useFlowOrThrow();
  const workflowSelectedNode = useWorkflowSelectedNodeOrThrow();

  const { activeTabId } = useTabList<TabId>(
    WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID,
  );

  const isInputTabDisabled = workflowSelectedNode === TRIGGER_STEP_ID;

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
