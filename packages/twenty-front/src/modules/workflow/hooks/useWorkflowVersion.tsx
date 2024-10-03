import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { WorkflowVersion } from '@/workflow/types/Workflow';

export const useWorkflowVersion = (workflowVersionId: string) => {
  const { record: workflowVersion } = useFindOneRecord<WorkflowVersion>({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    objectRecordId: workflowVersionId,
  });

  return workflowVersion;
};
