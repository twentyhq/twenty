import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type WorkflowRun } from '@/workflow/types/Workflow';
import { latestWorkflowRunFamilyState } from '@/workflow/states/latestWorkflowRunFamilyState';
import { useMemo } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { workflowRunSchema } from 'twenty-shared/workflow';

export const useWorkflowRun = ({
  workflowRunId,
}: {
  workflowRunId: string;
}): WorkflowRun | undefined => {
  const store = useStore();

  const { record: rawRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    objectRecordId: workflowRunId,
  });

  const {
    success,
    data: record,
    error,
  } = useMemo(() => workflowRunSchema.safeParse(rawRecord), [rawRecord]);

  if (!isDefined(rawRecord)) {
    return undefined;
  }

  if (!success) {
    throw error;
  }

  const incomingUpdatedAt = rawRecord.updatedAt as string | undefined;
  const latestAtom = latestWorkflowRunFamilyState.atomFamily(workflowRunId);
  const latest = store.get(latestAtom);

  if (
    isDefined(incomingUpdatedAt) &&
    isDefined(latest) &&
    new Date(incomingUpdatedAt).getTime() <
      new Date(latest.updatedAt).getTime()
  ) {
    return latest.record;
  }

  if (isDefined(incomingUpdatedAt)) {
    store.set(latestAtom, { record, updatedAt: incomingUpdatedAt });
  }

  return record;
};
