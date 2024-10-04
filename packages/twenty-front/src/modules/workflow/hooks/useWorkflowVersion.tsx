import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';

export const useWorkflowVersion = (workflowVersionId: string) => {
  const { record: workflowVersion } = useFindOneRecord<
    WorkflowVersion & { workflow: Omit<Workflow, 'versions'> }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    objectRecordId: workflowVersionId,
  });

  return workflowVersion;
};
