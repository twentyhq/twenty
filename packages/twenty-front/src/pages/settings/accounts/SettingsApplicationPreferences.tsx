import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { SettingsApplicationPreferencesDetail } from '~/pages/settings/accounts/SettingsApplicationPreferencesDetail';

export const SettingsApplicationPreferences = () => {
  const { t } = useLingui();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { applicationId } = useParams<{ applicationId: string }>();
  const { applicationsWithPreferences, loading, error, refetch } =
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

  if (isAppPreferencesEnabled && isDefined(error)) {
    return (
      <SettingsPageLayout
        title={t`App preferences`}
        links={[
          {
            children: t`User`,
            href: getSettingsPath(SettingsPath.ProfilePage),
          },
          {
            children: t`App preferences`,
            href: getSettingsPath(SettingsPath.Accounts),
          },
        ]}
      >
        <SettingsPageContainer>
          <SettingsApplicationLoadErrorBanner
            onRetry={() => refetch().catch(() => undefined)}
          />
        </SettingsPageContainer>
      </SettingsPageLayout>
    );
  }

  return <Navigate to={getSettingsPath(SettingsPath.Accounts)} replace />;
};
