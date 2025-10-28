import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useGetUpdatableWorkflowVersionOrThrow = (instanceId?: string) => {
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
    instanceId,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  const getUpdatableWorkflowVersion = async (): Promise<string> => {
    if (!isDefined(workflowVisualizerWorkflowId) || !isDefined(workflow)) {
      throw new Error('Failed to get updatable workflow version');
    }

    if (workflow.currentVersion.status === 'DRAFT') {
      return workflow.currentVersion.id;
    }

    const draftVersionId = await createDraftFromWorkflowVersion({
      workflowId: workflowVisualizerWorkflowId,
      workflowVersionIdToCopy: workflow.currentVersion.id,
    });

    if (!isDefined(draftVersionId)) {
      throw new Error('Failed to create draft version');
    }

    return draftVersionId;
  };

  return { getUpdatableWorkflowVersion };
};
