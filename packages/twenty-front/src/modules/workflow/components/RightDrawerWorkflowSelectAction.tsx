import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useCreateNode } from '@/workflow/hooks/useCreateNode';
import { createStepFromStepState } from '@/workflow/states/createStepFromStepState';
import { showPageWorkflowDiagramTriggerNodeSelectionState } from '@/workflow/states/showPageWorkflowDiagramTriggerNodeSelectionState';
import { showPageWorkflowIdState } from '@/workflow/states/showPageWorkflowIdState';
import { Workflow } from '@/workflow/types/Workflow';
import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  IconPlaystationSquare,
  IconPlug,
  IconPlus,
  IconSearch,
  IconSettingsAutomation,
} from 'twenty-ui';
import { v4 } from 'uuid';

// FIXME: copy-pasted
const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
  height: 100%;
`;

// FIXME: copy-pasted
const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
`;

const StyledActionListContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  padding-block: ${({ theme }) => theme.spacing(1)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
`;

export const TAB_LIST_COMPONENT_ID = 'workflow-page-right-tab-list';

export const RightDrawerWorkflowSelectAction = () => {
  const createStepFromStep = useRecoilValue(createStepFromStepState);
  const showPageWorkflowId = useRecoilValue(showPageWorkflowIdState);

  const setShowPageWorkflowDiagramTriggerNodeSelection = useSetRecoilState(
    showPageWorkflowDiagramTriggerNodeSelectionState,
  );

  const {
    record: workflow,
    loading,
    error,
  } = useFindOneRecord<Workflow>({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    objectRecordId: showPageWorkflowId,
    recordGqlFields: {
      id: true,
      name: true,
      versions: true,
      publishedVersionId: true,
    },
  });

  const { createNode } = useCreateNode({ workflow: workflow! });

  const tabListId = `${TAB_LIST_COMPONENT_ID}`;

  const options: Array<{
    id: string;
    name: string;
    type: 'standard' | 'custom';
    icon: any;
  }> = [
    {
      id: 'create-record',
      name: 'Create Record',
      type: 'standard',
      icon: IconPlus,
    },
    {
      id: 'find-records',
      name: 'Find Records',
      type: 'standard',
      icon: IconSearch,
    },
  ];

  const tabs = [
    {
      id: 'all',
      title: 'All',
      Icon: IconSettingsAutomation,
    },
    {
      id: 'standard',
      title: 'Standard',
      Icon: IconPlaystationSquare,
    },
    {
      id: 'custom',
      title: 'Custom',
      Icon: IconPlug,
    },
  ];

  const { activeTabIdState } = useTabList(tabListId);
  const activeTabId = useRecoilValue(activeTabIdState);

  const handleActionClick = async (actionId: string) => {
    try {
      if (createStepFromStep === undefined) {
        throw new Error('Select a step to create a new step from first.');
      }

      const newNodeId = v4();

      await createNode({
        parentNodeId: createStepFromStep,
        nodeToAdd: {
          id: newNodeId,
          name: actionId,
          type: 'CODE_ACTION',
          valid: true,
          settings: {
            serverlessFunctionId: '111',
            errorHandlingOptions: {
              continueOnFailure: {
                value: true,
              },
              retryOnFailure: {
                value: true,
              },
            },
          },
        },
      });

      setShowPageWorkflowDiagramTriggerNodeSelection(newNodeId);
    } catch (err) {
      console.error('Failed to create a node', err);
    }
  };

  return (
    <StyledShowPageRightContainer>
      <StyledTabListContainer>
        <TabList loading={false} tabListId={tabListId} tabs={tabs} />
      </StyledTabListContainer>

      <StyledActionListContainer>
        {options
          .filter(
            (option) => activeTabId === 'all' || option.type === activeTabId,
          )
          .map((option, index) => (
            <MenuItem
              key={`${activeTabId}-${index}`}
              LeftIcon={option.icon}
              text={option.name}
              onClick={() => {
                handleActionClick(option.id);
              }}
            />
          ))}
      </StyledActionListContainer>
    </StyledShowPageRightContainer>
  );
};
