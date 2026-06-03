import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type WorkflowRun } from '@/workflow/types/Workflow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useMemo } from 'react';
import { CoreObjectNameSingular, FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { workflowRunSchema } from 'twenty-shared/workflow';

export const useWorkflowRun = ({
  workflowRunId,
}: {
  workflowRunId: string;
}): WorkflowRun | undefined => {
  const isStepLogsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_RUN_STEP_LOGS_ENABLED,
  );

  const { recordGqlFields: defaultRecordGqlFields } =
    useGenerateDepthRecordGqlFieldsFromObject({
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
      depth: 1,
    });

  const recordGqlFields = useMemo(() => {
    if (isStepLogsEnabled) {
      return undefined;
    }

    const { stepLogs: _omit, ...rest } = defaultRecordGqlFields;

    return rest;
  }, [isStepLogsEnabled, defaultRecordGqlFields]);

  const { record: rawRecord } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkflowRun,
    objectRecordId: workflowRunId,
    recordGqlFields,
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

  return record;
};
