import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsAppPreferencesAccountsSection } from '@/settings/app-preferences/components/SettingsAppPreferencesAccountsSection';
import { SettingsAppPreferencesApplicationsSection } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationsSection';
import { useAppPreferencesApplications } from '@/settings/app-preferences/hooks/useAppPreferencesApplications';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SettingsAppPreferences = () => {
  const { t } = useLingui();

  const { accounts, loading: accountsLoading } = useMyConnectedAccounts({
    includeApplicationAccounts: true,
  });

  const { applications, loading: applicationsLoading } =
    useAppPreferencesApplications();

  const loading = accountsLoading || applicationsLoading;

  return (
    <SettingsPageLayout
      title={t`App preferences`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: t`App preferences` },
      ]}
    >
      <SettingsPageContainer overflow="visible">
        {loading ? (
          <SettingsSectionSkeletonLoader />
        ) : (
          <>
            <SettingsAppPreferencesAccountsSection accounts={accounts} />
            <SettingsAppPreferencesApplicationsSection
              applications={applications}
              accounts={accounts}
            />
          </>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
