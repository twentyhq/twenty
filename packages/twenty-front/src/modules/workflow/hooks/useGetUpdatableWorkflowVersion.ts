import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useGetUpdatableWorkflowVersion = () => {
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  const getUpdatableWorkflowVersion = async () => {
    if (!isDefined(workflowVisualizerWorkflowId) || !isDefined(workflow)) {
      return;
    }

    if (workflow.currentVersion.status === 'DRAFT') {
      return workflow.currentVersion.id;
    }

    return await createDraftFromWorkflowVersion({
      workflowId: workflowVisualizerWorkflowId,
      workflowVersionIdToCopy: workflow.currentVersion.id,
    });
  };

  return { getUpdatableWorkflowVersion };
};
