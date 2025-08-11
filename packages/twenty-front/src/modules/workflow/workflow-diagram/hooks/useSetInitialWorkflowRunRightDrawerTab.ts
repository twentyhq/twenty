import { getIsInputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsInputTabDisabled';
import { getIsOutputTabDisabled } from '@/command-menu/pages/workflow/step/view-run/utils/getIsOutputTabDisabled';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { WorkflowRunTabId } from '@/workflow/workflow-steps/types/WorkflowRunTabId';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';

export const useSetInitialWorkflowRunRightDrawerTab = () => {
  const setInitialWorkflowRunRightDrawerTab = useRecoilCallback(
    ({ snapshot, set }) =>
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

        const activeWorkflowRunRightDrawerTab = getSnapshotValue(
          snapshot,
          activeTabIdComponentState.atomFamily({
            instanceId: commandMenuPageInfo.instanceId,
          }),
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

          set(
            activeTabIdComponentState.atomFamily({
              instanceId: commandMenuPageInfo.instanceId,
            }),
            defaultTabId,
          );

          return;
        }

        if (
          (isInputTabDisabled &&
            activeWorkflowRunRightDrawerTab === WorkflowRunTabId.INPUT) ||
          (isOutputTabDisabled &&
            activeWorkflowRunRightDrawerTab === WorkflowRunTabId.OUTPUT)
        ) {
          set(
            activeTabIdComponentState.atomFamily({
              instanceId: commandMenuPageInfo.instanceId,
            }),
            WorkflowRunTabId.NODE,
          );
        }
      },
    [],
  );

  return {
    setInitialWorkflowRunRightDrawerTab,
  };
};
