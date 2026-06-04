import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type WorkflowRun } from '@/workflow/types/Workflow';
import { useEffect, useMemo, useRef } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { workflowRunSchema } from 'twenty-shared/workflow';

export const useWorkflowRun = ({
  workflowRunId,
}: {
  workflowRunId: string;
}): WorkflowRun | undefined => {
  const { record: rawRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    objectRecordId: workflowRunId,
  });

  const {
    success,
    data: record,
    error,
  } = useMemo(() => workflowRunSchema.safeParse(rawRecord), [rawRecord]);

  const lastCapturedValidationErrorWorkflowRunIdRef = useRef<string | null>(
    null,
  );

  useEffect(() => {
    if (
      !isDefined(rawRecord) ||
      success ||
      lastCapturedValidationErrorWorkflowRunIdRef.current === workflowRunId
    ) {
      return;
    }

    lastCapturedValidationErrorWorkflowRunIdRef.current = workflowRunId;

    void import('@sentry/react').then(({ captureException, withScope }) => {
      withScope((scope) => {
        scope.setTag('workflowRunSchemaValidation', 'true');
        scope.setExtra('workflowRunId', workflowRunId);
        scope.setExtra(
          'issues',
          error.issues.map((issue) => ({
            path: issue.path.join('.'),
            code: issue.code,
            received: 'input' in issue ? issue.input : undefined,
          })),
        );

        captureException(error);
      });
    });
  }, [error, rawRecord, success, workflowRunId]);

  if (!isDefined(rawRecord) || !success) {
    return undefined;
  }

  return record;
};
