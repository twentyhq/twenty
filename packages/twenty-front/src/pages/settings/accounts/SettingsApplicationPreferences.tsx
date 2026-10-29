import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SettingsApplicationPreferencesDetail } from '~/pages/settings/accounts/SettingsApplicationPreferencesDetail';

export const SettingsApplicationPreferences = () => {
  const { t } = useLingui();
  const { appId: applicationId } = useParams<{ appId: string }>();
  const { applicationsWithPreferences, loading, error, refetch } =
    useApplicationsWithPreferences();

  const applicationWithPreferences = applicationsWithPreferences.find(
    ({ application }) => application.id === applicationId,
  );

  if (isDefined(applicationWithPreferences)) {
    return (
      <SettingsApplicationPreferencesDetail
        applicationWithPreferences={applicationWithPreferences}
        refetchApplicationsWithPreferences={refetch}
      />
    );
  }

  if (loading) {
    return <SettingsSkeletonLoader />;
  }

  if (isDefined(error)) {
    return (
      <SettingsPageLayout
        title={t`Apps preferences`}
        links={[
          {
            children: t`User`,
            href: getSettingsPath(SettingsPath.ProfilePage),
          },
          {
            children: t`Apps preferences`,
            href: getSettingsPath(SettingsPath.AppPreferences),
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

  return <Navigate to={getSettingsPath(SettingsPath.AppPreferences)} replace />;
};
