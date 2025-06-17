import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { WorkflowRun } from '@/workflow/types/Workflow';
import { workflowRunSchema } from '@/workflow/validation-schemas/workflowSchema';
import { useEffect, useMemo } from 'react';

export const useWorkflowRun = ({
  workflowRunId,
}: {
  workflowRunId: string;
}): WorkflowRun | undefined => {
  const {
    record: rawRecord,
    loading: foLoading,
    error: foError,
  } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    objectRecordId: workflowRunId,
  });

  const {
    success,
    data: record,
    error,
  } = useMemo(() => workflowRunSchema.safeParse(rawRecord), [rawRecord]);

  console.log('in useWorkflowRun', {
    workflowRunId,
    rawRecord,
    foLoading,
    foError,
    success,
    record,
    error,
  });

  if (!success) {
    return undefined;
  }

  return record;
};
