import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { useResolveAccountsSettingsPath } from '@/settings/app-preferences/hooks/useResolveAccountsSettingsPath';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SettingsNewAccount = () => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { resolveAccountsSettingsPath } = useResolveAccountsSettingsPath();

  return (
    <SettingsPageLayout
      title={t`New Account`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: isAppPreferencesEnabled ? t`Apps preferences` : t`Accounts`,
          href: getSettingsPath(
            resolveAccountsSettingsPath(SettingsPath.Accounts),
          ),
        },
        { children: t`New` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsNewAccountSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
