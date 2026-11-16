import { FeatureFlagKey } from 'twenty-shared/types';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsAiDataPolicyConfigurable } from '@/settings/privacy/hooks/useIsAiDataPolicyConfigurable';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useHasPrivacySettings = () => {
  const isAiDataPolicyEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_DATA_POLICY_ENABLED,
  );
  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const isAiDataPolicyConfigurable = useIsAiDataPolicyConfigurable();

  return (
    isAiDataPolicyEnabled &&
    (isMultiWorkspaceEnabled || isAiDataPolicyConfigurable)
  );
};
