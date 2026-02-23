import { getIsInputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsInputTabDisabled';
import { getIsOutputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsOutputTabDisabled';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { WorkflowRunTabId } from '@/workflow/workflow-steps/types/WorkflowRunTabId';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';

export const useSetInitialWorkflowRunRightDrawerTab = () => {
  const setInitialWorkflowRunRightDrawerTab = useCallback(
    ({
      workflowSelectedNode,
      stepExecutionStatus,
    }: {
      workflowSelectedNode: string;
      stepExecutionStatus: WorkflowRunStepStatus;
    }) => {
      const commandMenuPageInfo = jotaiStore.get(commandMenuPageInfoState.atom);

      const activeTabIdAtom = activeTabIdComponentState.atomFamily({
        instanceId: commandMenuPageInfo.instanceId,
      });

      const activeWorkflowRunRightDrawerTab = jotaiStore.get(
        activeTabIdAtom,
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

        jotaiStore.set(activeTabIdAtom, defaultTabId);

        return;
      }

      if (
        (isInputTabDisabled &&
          activeWorkflowRunRightDrawerTab === WorkflowRunTabId.INPUT) ||
        (isOutputTabDisabled &&
          activeWorkflowRunRightDrawerTab === WorkflowRunTabId.OUTPUT)
      ) {
        jotaiStore.set(activeTabIdAtom, WorkflowRunTabId.NODE);
      }
    },
    [],
  );

  return {
    setInitialWorkflowRunRightDrawerTab,
  };
};
