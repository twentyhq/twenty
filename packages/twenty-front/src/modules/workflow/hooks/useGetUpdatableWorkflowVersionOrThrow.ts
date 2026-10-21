import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowDraftVersionCreationComponentState } from '@/workflow/states/workflowDraftVersionCreationComponentState';
import { workflowFlowSaveDraftVersionIdComponentState } from '@/workflow/states/workflowFlowSaveDraftVersionIdComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';

export const useGetUpdatableWorkflowVersionOrThrow = (instanceId?: string) => {
  const store = useStore();
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
    instanceId,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);
  const flowState = useAtomComponentStateCallbackState(
    flowComponentState,
    instanceId,
  );
  const saveDraftVersionIdState = useAtomComponentStateCallbackState(
    workflowFlowSaveDraftVersionIdComponentState,
    instanceId,
  );
  const draftVersionCreationState = useAtomComponentStateCallbackState(
    workflowDraftVersionCreationComponentState,
    instanceId,
  );

  const getUpdatableWorkflowVersion = async (): Promise<string> => {
    const saveDraftVersionId = store.get(saveDraftVersionIdState);

    // The caller may run on a stale render that has not seen a draft created by an earlier save
    if (
      isDefined(saveDraftVersionId) &&
      saveDraftVersionId === store.get(flowState)?.workflowVersionId
    ) {
      return saveDraftVersionId;
    }

    if (!isDefined(workflowVisualizerWorkflowId) || !isDefined(workflow)) {
      throw new Error(
        doNotTranslate('Failed to get updatable workflow version'),
      );
    }

    if (workflow.currentVersion.status === 'DRAFT') {
      store.set(saveDraftVersionIdState, workflow.currentVersion.id);

      return workflow.currentVersion.id;
    }

    // A second draft creation would overwrite the first draft with the copied version
    const draftVersionCreation =
      store.get(draftVersionCreationState) ??
      createDraftFromWorkflowVersion({
        workflowId: workflowVisualizerWorkflowId,
        workflowVersionIdToCopy: workflow.currentVersion.id,
      }).finally(() => store.set(draftVersionCreationState, undefined));

    store.set(draftVersionCreationState, draftVersionCreation);

    const draftVersionId = await draftVersionCreation;

    if (!isDefined(draftVersionId)) {
      throw new Error(doNotTranslate('Failed to create draft version'));
    }

    store.set(saveDraftVersionIdState, draftVersionId);

    return draftVersionId;
  };

  return { getUpdatableWorkflowVersion };
};
