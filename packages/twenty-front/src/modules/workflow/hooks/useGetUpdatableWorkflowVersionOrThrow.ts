import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useGetUpdatableWorkflowVersionOrThrow = (instanceId?: string) => {
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const workflowVisualizerWorkflowId = useAtomComponentStateValue(
    workflowVisualizerWorkflowIdComponentState,
    instanceId,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);
  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);

  const getUpdatableWorkflowVersion = async (): Promise<string> => {
    if (!isDefined(workflowVisualizerWorkflowId) || !isDefined(workflow)) {
      throw new Error('Failed to get updatable workflow version');
    }

    const copiedVersionId = workflow.currentVersion.id;

    if (workflow.currentVersion.status === 'DRAFT') {
      return copiedVersionId;
    }

    const draftVersionId = await createDraftFromWorkflowVersion({
      workflowId: workflowVisualizerWorkflowId,
      workflowVersionIdToCopy: copiedVersionId,
    });

    if (!isDefined(draftVersionId)) {
      throw new Error('Failed to create draft version');
    }

    setFlow((currentFlow) =>
      isDefined(currentFlow) &&
      currentFlow.workflowVersionId === copiedVersionId
        ? { ...currentFlow, workflowVersionId: draftVersionId }
        : currentFlow,
    );

    return draftVersionId;
  };

  return { getUpdatableWorkflowVersion };
};
