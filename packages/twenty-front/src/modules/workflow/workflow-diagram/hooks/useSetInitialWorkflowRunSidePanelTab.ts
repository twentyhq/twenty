import { getIsInputTabDisabled } from '@/side-panel/pages/workflow/step/view-run/utils/getIsInputTabDisabled';
import { getIsOutputTabDisabled } from '@/side-panel/pages/workflow/step/view-run/utils/getIsOutputTabDisabled';
import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { WorkflowRunTabId } from '@/workflow/workflow-steps/types/WorkflowRunTabId';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { useStore } from 'jotai';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

export const useSetInitialWorkflowRunSidePanelTab = () => {
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();
  const setInitialWorkflowRunSidePanelTab = useCallback(
    ({
      workflowSelectedNode,
      stepExecutionStatus,
    }: {
      workflowSelectedNode: string;
      stepExecutionStatus: WorkflowRunStepStatus;
    }) => {
      const sidePanelPageInfo = store.get(sidePanelPageInfoSelector.atom);

      const activeTabId = activeTabIdComponentState.atomFamily({
        instanceId: sidePanelPageInfo.instanceId,
        surfaceId,
      });

      const activeWorkflowRunSidePanelTab = store.get(
        activeTabId,
      ) as WorkflowRunTabId | null;

      const isInputTabDisabled = getIsInputTabDisabled({
        stepExecutionStatus,
        workflowSelectedNode,
      });
      const isOutputTabDisabled = getIsOutputTabDisabled({
        stepExecutionStatus,
      });

      if (!isDefined(activeWorkflowRunSidePanelTab)) {
        const defaultTabId = isOutputTabDisabled
          ? WorkflowRunTabId.NODE
          : WorkflowRunTabId.OUTPUT;

        store.set(activeTabId, defaultTabId);

        return;
      }

      if (
        (isInputTabDisabled &&
          activeWorkflowRunSidePanelTab === WorkflowRunTabId.INPUT) ||
        (isOutputTabDisabled &&
          activeWorkflowRunSidePanelTab === WorkflowRunTabId.OUTPUT)
      ) {
        store.set(activeTabId, WorkflowRunTabId.NODE);
      }
    },
    [store, surfaceId],
  );

  return {
    setInitialWorkflowRunSidePanelTab,
  };
};
