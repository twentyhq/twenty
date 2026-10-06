import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsAppPreferencesApplicationSection } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationSection';
import { SettingsAppPreferencesConnectedAccountsSection } from '@/settings/app-preferences/components/SettingsAppPreferencesConnectedAccountsSection';
import { useApplicationUserSettingsMenuItems } from '@/settings/app-preferences/hooks/useApplicationUserSettingsMenuItems';
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

  const {
    applicationUserSettingsMenuItems,
    loading: settingsMenuItemsLoading,
  } = useApplicationUserSettingsMenuItems();

  const loading = accountsLoading || settingsMenuItemsLoading;

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
            <SettingsAppPreferencesConnectedAccountsSection
              accounts={accounts}
            />
            {applicationUserSettingsMenuItems.map(
              ({ application, settingsMenuItem }) => (
                <SettingsAppPreferencesApplicationSection
                  key={settingsMenuItem.id}
                  applicationId={application.id}
                  applicationName={application.name}
                  applicationLogoUrl={application.logoUrl}
                  title={settingsMenuItem.title}
                  frontComponentId={settingsMenuItem.frontComponentId}
                />
              ),
            )}
            <SettingsAccountsBlocklistSection />
            <SettingsAccountsSettingsSection />
          </>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
