import { SingleTabProps, TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { WorkflowRunStepDetail } from '@/workflow/workflow-steps/components/WorkflowRunStepDetail';
import { WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/constants/WorkflowRunStepSidePanelTabListComponentId';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { IconLogin2, IconLogout, IconStepInto } from 'twenty-ui';

const StyledTabListContainer = styled.div`
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing(2)};
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(10)};
  background-color: ${({ theme }) => theme.background.secondary};
`;

type TabId = 'node' | 'input' | 'output';

export const RightDrawerWorkflowRunViewStep = () => {
  const flow = useFlowOrThrow();

  const workflowSelectedNode = useRecoilValue(workflowSelectedNodeState);
  if (!isDefined(workflowSelectedNode)) {
    throw new Error(
      'Expected a node to be selected. Selecting a node is mandatory to edit it.',
    );
  }

  const { activeTabId } = useTabList<TabId>(
    WORKFLOW_RUN_STEP_SIDE_PANEL_TAB_LIST_COMPONENT_ID,
  );

  const tabs: SingleTabProps<TabId>[] = [
    { id: 'node', title: 'Node', Icon: IconStepInto },
    { id: 'input', title: 'Input', Icon: IconLogin2 },
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
        <WorkflowRunStepDetail
          stepId={workflowSelectedNode}
          trigger={flow.trigger}
          steps={flow.steps}
        />
      ) : null}
    </>
  );
};
