import { SettingsAccountGroupDetail } from '@/settings/accounts/components/SettingsAccountGroupDetail';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Navigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SettingsAccountDetail = () => {
  const isConsolidationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CONNECTED_ACCOUNTS_CONSOLIDATION_ENABLED,
  );

  return isConsolidationEnabled ? (
    <SettingsAccountGroupDetail />
  ) : (
    <Navigate to={getSettingsPath(SettingsPath.Accounts)} replace />
  );
};
