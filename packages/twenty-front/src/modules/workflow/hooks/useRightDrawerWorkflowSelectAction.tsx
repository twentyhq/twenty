import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useCreateNode } from '@/workflow/hooks/useCreateNode';
import { showPageWorkflowDiagramTriggerNodeSelectionState } from '@/workflow/states/showPageWorkflowDiagramTriggerNodeSelectionState';
import { workflowCreateStepFromParentStepIdState } from '@/workflow/states/workflowCreateStepFromParentStepIdState';
import { Workflow } from '@/workflow/types/Workflow';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  IconPlaystationSquare,
  IconPlug,
  IconPlus,
  IconSearch,
  IconSettingsAutomation,
} from 'twenty-ui';
import { v4 } from 'uuid';

export const useRightDrawerWorkflowSelectAction = ({
  tabListId,
  workflow,
}: {
  tabListId: string;
  workflow: Workflow;
}) => {
  const workflowCreateStepFromParentStepId = useRecoilValue(
    workflowCreateStepFromParentStepIdState,
  );

  const setShowPageWorkflowDiagramTriggerNodeSelection = useSetRecoilState(
    showPageWorkflowDiagramTriggerNodeSelectionState,
  );

  const { createNode } = useCreateNode({ workflow });

  const allOptions: Array<{
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

  const options = allOptions.filter(
    (option) => activeTabId === 'all' || option.type === activeTabId,
  );

  const handleActionClick = async (actionId: string) => {
    if (workflowCreateStepFromParentStepId === undefined) {
      throw new Error('Select a step to create a new step from first.');
    }

    const newNodeId = v4();

    /**
     * FIXME: For now, the data of the node to create are mostly static.
     */
    await createNode({
      parentNodeId: workflowCreateStepFromParentStepId,
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
  };

  return {
    tabs,
    options,
    handleActionClick,
  };
};
