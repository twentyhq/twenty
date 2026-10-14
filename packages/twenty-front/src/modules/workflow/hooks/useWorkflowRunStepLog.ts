import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type WorkflowRun } from '@/workflow/types/Workflow';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const useWorkflowRunStepLog = ({
  workflowRunId,
  stepId,
  skip = false,
}: {
  workflowRunId: string;
  stepId: string;
  skip?: boolean;
}): unknown | undefined => {
  const { record } = useFindOneRecord<
    Pick<WorkflowRun, '__typename' | 'id' | 'stepLogs'>
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    objectRecordId: workflowRunId,
    recordGqlFields: { id: true, stepLogs: true },
    skip,
  });

  return record?.stepLogs?.[stepId];
};
