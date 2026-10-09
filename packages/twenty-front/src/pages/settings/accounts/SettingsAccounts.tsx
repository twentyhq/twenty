import { SettingsAccountGroupsSection } from '@/settings/app-preferences/components/SettingsAccountGroupsSection';
import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountsLegacySections } from '@/settings/accounts/components/SettingsAccountsLegacySections';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SettingsAccounts = () => {
  const { t } = useLingui();

  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const pageTitle = isAppPreferencesEnabled ? t`App preferences` : t`Account`;

  return (
    <SettingsPageLayout
      title={pageTitle}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: pageTitle },
      ]}
    >
      <SettingsPageContainer>
        {isAppPreferencesEnabled ? (
          <>
            <SettingsAccountGroupsSection />
            <SettingsAccountsBlocklistSection />
          </>
        ) : (
          <SettingsAccountsLegacySections />
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
