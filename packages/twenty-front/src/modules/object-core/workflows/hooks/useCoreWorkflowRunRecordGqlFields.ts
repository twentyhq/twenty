import { FeatureFlagKey } from 'twenty-shared/types';

import { getCoreWorkflowRunRecordGqlFields } from '@/object-core/workflows/utils/getCoreWorkflowRunRecordGqlFields';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useCoreWorkflowRunRecordGqlFields = (
  objectNameSingular: string,
) => {
  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  return getCoreWorkflowRunRecordGqlFields({
    objectNameSingular,
    isWorkflowCoreIndexPageEnabled,
  });
};
