import { SettingsAppPreferencesAccountsSection } from '@/settings/app-preferences/components/SettingsAppPreferencesAccountsSection';
import { SettingsAppPreferencesAppsTable } from '@/settings/app-preferences/components/SettingsAppPreferencesAppsTable';
import { SettingsAppPreferencesBuiltInApplicationRows } from '@/settings/app-preferences/components/SettingsAppPreferencesBuiltInApplicationRows';
import { SettingsAppPreferencesInstalledApplicationRows } from '@/settings/app-preferences/components/SettingsAppPreferencesInstalledApplicationRows';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const SettingsAppPreferences = () => {
  const { t } = useLingui();
  const canManageConnectedAccounts = useHasPermissionFlag(
    PermissionFlagType.CONNECTED_ACCOUNTS,
  );

  return (
    <SettingsPageLayout
      title={t`Apps`}
      links={[
        { children: t`User`, href: getSettingsPath(SettingsPath.ProfilePage) },
        { children: t`Apps` },
      ]}
    >
      <SettingsPageContainer>
        {canManageConnectedAccounts && (
          <SettingsAppPreferencesAccountsSection />
        )}
        <Section.Root>
          <Section.Header
            title={t`Apps preferences`}
            description={t`Choose your preferences for the apps installed on your workspace by the admin`}
          />
          <SettingsAppPreferencesAppsTable>
            {canManageConnectedAccounts && (
              <SettingsAppPreferencesBuiltInApplicationRows />
            )}
            <SettingsAppPreferencesInstalledApplicationRows />
          </SettingsAppPreferencesAppsTable>
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
