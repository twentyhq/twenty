import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { WorkflowVersion } from '@/workflow/types/Workflow';

export const useCreateNewWorkflowVersion = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { createOneRecord: createOneWorkflowVersion } =
    useCreateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const createNewWorkflowVersion = (
    workflowVersionData: Pick<
      WorkflowVersion,
      'name' | 'status' | 'trigger' | 'steps'
    >,
  ) => {
    return createOneWorkflowVersion({
      workflowId,
      ...workflowVersionData,
    });
  };

  return {
    createNewWorkflowVersion,
  };
};
