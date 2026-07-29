import { useQuery } from '@apollo/client/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { GET_WORKFLOW_VERSION_CONTENT } from '@/workflow/workflow-version/graphql/queries/getWorkflowVersionContent';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export type WorkflowVersionContent = {
  workflowVersionId: string;
  trigger: WorkflowVersion['trigger'];
  steps: WorkflowVersion['steps'];
};

// The single place deciding where workflow version content (trigger/steps)
// is read from: the workspace record today, core when the flag is on.
export const useWorkflowVersionContent = (workflowVersionId?: string) => {
  const apolloCoreClient = useApolloCoreClient();
  const isWorkflowVersionInCoreEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_VERSION_IN_CORE_ENABLED,
  );

  const {
    data: coreData,
    loading: coreLoading,
    refetch: refetchCore,
  } = useQuery<{
    workflowVersionContent: WorkflowVersionContent;
  }>(GET_WORKFLOW_VERSION_CONTENT, {
    client: apolloCoreClient,
    variables: { workflowVersionId },
    skip: !isWorkflowVersionInCoreEnabled || !isDefined(workflowVersionId),
  });

  const {
    record: workflowVersionRecord,
    loading: recordLoading,
    refetch: refetchRecord,
  } = useFindOneRecord<WorkflowVersion>({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    objectRecordId: workflowVersionId,
    recordGqlFields: {
      id: true,
      trigger: true,
      steps: true,
    },
    skip: isWorkflowVersionInCoreEnabled || !isDefined(workflowVersionId),
  });

  const content: WorkflowVersionContent | undefined =
    isWorkflowVersionInCoreEnabled
      ? coreData?.workflowVersionContent
      : isDefined(workflowVersionRecord)
        ? {
            workflowVersionId: workflowVersionRecord.id,
            trigger: workflowVersionRecord.trigger,
            steps: workflowVersionRecord.steps,
          }
        : undefined;

  const refetchContent = isWorkflowVersionInCoreEnabled
    ? refetchCore
    : refetchRecord;

  return {
    content,
    loading: isWorkflowVersionInCoreEnabled ? coreLoading : recordLoading,
    refetchContent,
  };
};
