import { SingleTabProps, TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { workflowSelectedNodeState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeState';
import { WorkflowStepDetail } from '@/workflow/workflow-steps/components/WorkflowStepDetail';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { IconCode, IconStepInto } from 'twenty-ui';

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

type TabId = 'node' | 'other';

export const RightDrawerWorkflowRunViewStep = () => {
  const flow = useFlowOrThrow();

  const workflowSelectedNode = useRecoilValue(workflowSelectedNodeState);
  if (!isDefined(workflowSelectedNode)) {
    throw new Error(
      'Expected a node to be selected. Selecting a node is mandatory to edit it.',
    );
  }

  const tabListId = `${'workflow-run-right-drawer'}`;
  const { activeTabId } = useTabList<TabId>(tabListId);

  const tabs: SingleTabProps<TabId>[] = [
    { id: 'node', title: 'Node', Icon: IconStepInto },
    { id: 'other', title: 'Code', Icon: IconCode },
  ];

  return (
    <>
      <StyledTabListContainer>
        <TabList
          tabListInstanceId={tabListId}
          tabs={tabs}
          behaveAsLinks={false}
        />
      </StyledTabListContainer>

      {activeTabId === 'node' ? (
        <WorkflowStepDetail
          stepId={workflowSelectedNode}
          trigger={flow.trigger}
          steps={flow.steps}
          readonly
        />
      ) : null}
    </>
  );
};
