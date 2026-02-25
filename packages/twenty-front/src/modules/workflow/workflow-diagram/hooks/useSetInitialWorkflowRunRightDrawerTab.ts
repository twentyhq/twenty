import { getIsInputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsInputTabDisabled';
import { getIsOutputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsOutputTabDisabled';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { WorkflowRunTabId } from '@/workflow/workflow-steps/types/WorkflowRunTabId';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { useStore } from 'jotai';

export const useSetInitialWorkflowRunRightDrawerTab = () => {
  const store = useStore();
  const setInitialWorkflowRunRightDrawerTab = useCallback(
    ({
      workflowSelectedNode,
      stepExecutionStatus,
    }: {
      workflowSelectedNode: string;
      stepExecutionStatus: WorkflowRunStepStatus;
    }) => {
      const commandMenuPageInfo = store.get(commandMenuPageInfoState.atom);

      const activeTabId = activeTabIdComponentState.atomFamily({
        instanceId: commandMenuPageInfo.instanceId,
      });

      const activeWorkflowRunRightDrawerTab = store.get(
        activeTabId,
      ) as WorkflowRunTabId | null;

      const isInputTabDisabled = getIsInputTabDisabled({
        stepExecutionStatus,
        workflowSelectedNode,
      });
      const isOutputTabDisabled = getIsOutputTabDisabled({
        stepExecutionStatus,
      });

      if (!isDefined(activeWorkflowRunRightDrawerTab)) {
        const defaultTabId = isOutputTabDisabled
          ? WorkflowRunTabId.NODE
          : WorkflowRunTabId.OUTPUT;

        store.set(activeTabId, defaultTabId);

        return;
      }

      if (
        (isInputTabDisabled &&
          activeWorkflowRunRightDrawerTab === WorkflowRunTabId.INPUT) ||
        (isOutputTabDisabled &&
          activeWorkflowRunRightDrawerTab === WorkflowRunTabId.OUTPUT)
      ) {
        store.set(activeTabId, WorkflowRunTabId.NODE);
      }
    },
    [store],
  );

  return {
    setInitialWorkflowRunRightDrawerTab,
  };
};
