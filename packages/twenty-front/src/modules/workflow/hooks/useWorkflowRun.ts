import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { workflowRunSchema } from '@/workflow/validation-schemas/workflowSchema';
import { useListenUpdates } from '@/subscription/hooks/useListenUpdates';

export const useWorkflowRun = ({
  workflowRunId,
}: {
  workflowRunId: string;
}): WorkflowRun | undefined => {
  const { record: rawRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    objectRecordId: workflowRunId,
  });

  const { success, data: record } = workflowRunSchema.safeParse(rawRecord);

  useListenUpdates({
    objectNameSingular: 'workflowRun',
    recordId: workflowRunId,
    listenedFields: ['status', 'output'],
  });

  if (!success) {
    return undefined;
  }

  return record;
};
