import { getIsInputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsInputTabDisabled';
import { getIsOutputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsOutputTabDisabled';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useStore } from 'jotai';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { WorkflowRunTabId } from '@/workflow/workflow-steps/types/WorkflowRunTabId';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';

export const useSetInitialWorkflowRunRightDrawerTab = () => {
  const store = useStore();

  const setInitialWorkflowRunRightDrawerTab = useRecoilCallback(
    ({ snapshot }) =>
      ({
        workflowSelectedNode,
        stepExecutionStatus,
      }: {
        workflowSelectedNode: string;
        stepExecutionStatus: WorkflowRunStepStatus;
      }) => {
        const commandMenuPageInfo = getSnapshotValue(
          snapshot,
          commandMenuPageInfoState,
        );

        const activeTabIdAtom = activeTabIdComponentState.atomFamily({
          instanceId: commandMenuPageInfo.instanceId,
        });

        const activeWorkflowRunRightDrawerTab = store.get(
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

          store.set(activeTabIdAtom, defaultTabId);

          return;
        }

        if (
          (isInputTabDisabled &&
            activeWorkflowRunRightDrawerTab === WorkflowRunTabId.INPUT) ||
          (isOutputTabDisabled &&
            activeWorkflowRunRightDrawerTab === WorkflowRunTabId.OUTPUT)
        ) {
          store.set(activeTabIdAtom, WorkflowRunTabId.NODE);
        }
      },
    [store],
  );

  return {
    setInitialWorkflowRunRightDrawerTab,
  };
};
