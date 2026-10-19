import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { SettingsApplicationPreferencesDetail } from '~/pages/settings/accounts/SettingsApplicationPreferencesDetail';

export const SettingsApplicationPreferences = () => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { applicationId } = useParams<{ applicationId: string }>();
  const { applicationsWithPreferences, loading, refetch } =
    useApplicationsWithPreferences();

  const applicationWithPreferences = applicationsWithPreferences.find(
    ({ application }) => application.id === applicationId,
  );

  if (isAppPreferencesEnabled && isDefined(applicationWithPreferences)) {
    return (
      <SettingsApplicationPreferencesDetail
        applicationWithPreferences={applicationWithPreferences}
        refetchApplicationsWithPreferences={refetch}
      />
    );
  }

  if (isAppPreferencesEnabled && loading) {
    return <SettingsSkeletonLoader />;
  }

  return <Navigate to={getSettingsPath(SettingsPath.Accounts)} replace />;
};
