import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { WorkflowVersion } from '@/workflow/types/Workflow';

export const useCreateNewWorkflowVersion = () => {
  const { createOneRecord: createOneWorkflowVersion } =
    useCreateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const createNewWorkflowVersion = async (
    workflowVersionData: Pick<
      WorkflowVersion,
      'workflowId' | 'name' | 'status' | 'trigger' | 'steps'
    >,
  ) => {
    return await createOneWorkflowVersion(workflowVersionData);
  };

  return {
    createNewWorkflowVersion,
  };
};
