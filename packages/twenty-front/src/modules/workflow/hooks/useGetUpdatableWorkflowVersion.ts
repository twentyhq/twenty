import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { useCreateNewWorkflowVersion } from '@/workflow/hooks/useCreateNewWorkflowVersion';

export const useGetUpdatableWorkflowVersion = () => {
  const { createNewWorkflowVersion } = useCreateNewWorkflowVersion();
  const getUpdatableWorkflowVersion = async (
    workflow: WorkflowWithCurrentVersion,
  ) => {
    if (workflow.currentVersion.status === 'DRAFT') {
      return workflow.currentVersion;
    }

    return await createNewWorkflowVersion({
      workflowId: workflow.id,
      name: `v${workflow.versions.length + 1}`,
      status: 'DRAFT',
      trigger: workflow.currentVersion.trigger,
      steps: workflow.currentVersion.steps,
    });
  };

  return { getUpdatableWorkflowVersion };
};
