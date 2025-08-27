import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type WorkflowRun } from '@/workflow/types/Workflow';

export const useWorkflowRunUnsafe = ({
  workflowRunId,
}: {
  workflowRunId: string;
}) => {
  const { record } = useFindOneRecord<WorkflowRun>({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    objectRecordId: workflowRunId,
  });

  return record;
};
