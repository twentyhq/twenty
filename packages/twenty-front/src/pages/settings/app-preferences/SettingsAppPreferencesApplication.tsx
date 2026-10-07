import { AppChip } from '@/applications/components/AppChip';
import { SettingsAppPreferencesApplicationForm } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationForm';
import { useMyAppPreferencesApplicationVariables } from '@/settings/app-preferences/hooks/useMyAppPreferencesApplicationVariables';
import { useMyAppPreferencesApplications } from '@/settings/app-preferences/hooks/useMyAppPreferencesApplications';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';

export const SettingsAppPreferencesApplication = () => {
  const { t } = useLingui();
  const { applicationId } = useParams<{ applicationId: string }>();
  const {
    applications,
    loading: applicationsLoading,
    error: applicationsError,
    refetch: refetchApplications,
  } = useMyAppPreferencesApplications();
  const application = applications.find(({ id }) => id === applicationId);
  const {
    applicationVariables,
    hasLoaded: variablesHaveLoaded,
    loading: variablesLoading,
    error: variablesError,
    refetch: refetchVariables,
  } = useMyAppPreferencesApplicationVariables(application?.universalIdentifier);

  const loading = applicationsLoading || variablesLoading;
  const hasError = isDefined(applicationsError) || isDefined(variablesError);

  if (variablesHaveLoaded && isDefined(application)) {
    return (
      <SettingsAppPreferencesApplicationForm
        key={application.id}
        application={application}
        applicationVariables={applicationVariables}
        onRefetch={refetchVariables}
      />
    );
  }

  const title = application?.name ?? t`App preferences`;

  return (
    <SettingsPageLayout
      title={title}
      icon={
        isDefined(application) ? (
          <AppChip
            applicationId={application.id}
            logoUrl={application.logoUrl}
            fallbackApplicationData={{ name: application.name }}
            size="md"
            chipOnly
          />
        ) : undefined
      }
      links={[
        {
          children: t`Apps`,
          href: getSettingsPath(SettingsPath.AppPreferences),
        },
        { children: title },
      ]}
    >
      <SettingsPageContainer>
        {loading ? (
          <SettingsSectionSkeletonLoader />
        ) : (
          <>
            <InlineBanner
              variant="compact"
              color={hasError ? 'danger' : 'blue'}
              message={
                hasError
                  ? t`Unable to load app preferences.`
                  : t`This app is no longer available in your workspace.`
              }
            />
            {hasError && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  isDefined(application)
                    ? refetchVariables()
                    : refetchApplications()
                }
              >{t`Retry`}</Button>
            )}
          </>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
