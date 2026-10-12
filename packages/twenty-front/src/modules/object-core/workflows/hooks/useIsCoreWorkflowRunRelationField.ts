import { FeatureFlagKey } from 'twenty-shared/types';

import { isHiddenWorkspaceWorkflowRunRelationField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunRelationField';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useIsCoreWorkflowRunRelationField = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular?: string | null;
  fieldName: string;
}) => {
  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  return isHiddenWorkspaceWorkflowRunRelationField({
    objectNameSingular,
    fieldName,
    isWorkflowCoreIndexPageEnabled,
  });
};
