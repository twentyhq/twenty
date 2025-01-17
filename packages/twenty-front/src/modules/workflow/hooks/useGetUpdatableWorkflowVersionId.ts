import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';

export const useGetUpdatableWorkflowVersionId = () => {
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const getUpdatableWorkflowVersionId = async (
    workflow: WorkflowWithCurrentVersion,
  ) => {
    if (workflow.currentVersion.status === 'DRAFT') {
      return workflow.currentVersion.id;
    }
    return await createDraftFromWorkflowVersion({
      workflowId: workflow.id,
      workflowVersionIdToCopy: workflow.currentVersion.id,
    });
  };

  return { getUpdatableWorkflowVersionId };
};
