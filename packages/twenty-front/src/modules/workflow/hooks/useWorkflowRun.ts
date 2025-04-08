import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { workflowRunSchema } from '@/workflow/validation-schemas/workflowSchema';
import { useOnDbEvent } from '@/subscription/hooks/useOnDbEvent';

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

  useOnDbEvent({
    onData: ({ data }) => console.log('data received', data),
  });

  if (!success) {
    return undefined;
  }

  return record;
};
