import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountsConnectedAccountsListCard } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsListCard';
import { SettingsAccountsConnectedAccountsTable } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsTable';
import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SettingsAccounts = () => {
  const { t } = useLingui();

  const { accounts: allAccounts, loading } = useMyConnectedAccounts();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );

  return (
    <SettingsPageLayout
      title={t`Account`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: t`Account` },
      ]}
    >
      <SettingsPageContainer>
        {loading ? (
          <SettingsSectionSkeletonLoader />
        ) : (
          <>
            <Section.Root>
              <Section.Header
                title={
                  isAppPreferencesEnabled ? t`Accounts` : t`Connected accounts`
                }
                description={
                  isAppPreferencesEnabled
                    ? t`Shared accounts between apps.`
                    : t`Manage your internet accounts.`
                }
              />
              {isAppPreferencesEnabled ? (
                <SettingsAccountsConnectedAccountsTable
                  accounts={allAccounts}
                />
              ) : (
                <SettingsAccountsConnectedAccountsListCard
                  accounts={allAccounts}
                />
              )}
            </Section.Root>
            <SettingsAccountsBlocklistSection />
            <SettingsAccountsSettingsSection />
          </>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
