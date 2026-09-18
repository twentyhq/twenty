import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from 'twenty-shared/types';

export const useIsWorkflowCoreEnabled = () =>
  useIsFeatureEnabled(FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED);
