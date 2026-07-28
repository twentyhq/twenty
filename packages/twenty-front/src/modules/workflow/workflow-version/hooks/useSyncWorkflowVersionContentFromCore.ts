import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { GET_WORKFLOW_VERSION_CONTENT } from '@/workflow/workflow-version/graphql/queries/getWorkflowVersionContent';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type WorkflowVersionContent = {
  workflowVersionId: string;
  trigger: WorkflowVersion['trigger'];
  steps: WorkflowVersion['steps'];
};

// When workflow version content lives in core, the record read still returns the
// workspace columns. Fetch the core content and write it into the record cache so
// every existing consumer and optimistic update keeps working unchanged.
export const useSyncWorkflowVersionContentFromCore = (
  workflowVersionId?: string,
) => {
  const apolloCoreClient = useApolloCoreClient();
  const isWorkflowVersionInCoreEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_VERSION_IN_CORE_ENABLED,
  );

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
  });

  const { data } = useQuery<{
    workflowVersionContent: WorkflowVersionContent;
  }>(GET_WORKFLOW_VERSION_CONTENT, {
    client: apolloCoreClient,
    variables: { workflowVersionId },
    skip: !isWorkflowVersionInCoreEnabled || !isDefined(workflowVersionId),
  });

  const coreContent = data?.workflowVersionContent;

  useEffect(() => {
    if (!isDefined(coreContent) || !isDefined(workflowVersionId)) {
      return;
    }

    const cachedRecord = getRecordFromCache<WorkflowVersion>(workflowVersionId);

    if (!isDefined(cachedRecord)) {
      return;
    }

    updateRecordFromCache({
      objectMetadataItems,
      objectMetadataItem,
      cache: apolloCoreClient.cache,
      record: {
        ...cachedRecord,
        trigger: coreContent.trigger,
        steps: coreContent.steps,
      },
      recordGqlFields: { trigger: true, steps: true },
      objectPermissionsByObjectMetadataId,
    });
  }, [
    coreContent,
    workflowVersionId,
    getRecordFromCache,
    objectMetadataItems,
    objectMetadataItem,
    apolloCoreClient.cache,
    objectPermissionsByObjectMetadataId,
  ]);
};
