import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';

export const useGetUpdatableWorkflowVersion = () => {
  const { createDraftFromWorkflowVersion } =
    useCreateDraftFromWorkflowVersion();
  const getUpdatableWorkflowVersion = async (
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

  return { getUpdatableWorkflowVersion };
};
