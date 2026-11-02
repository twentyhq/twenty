import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { useAccountsSettingsBreadcrumbLink } from '@/settings/app-preferences/hooks/useAccountsSettingsBreadcrumbLink';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SettingsNewAccount = () => {
  const accountsBreadcrumbLink = useAccountsSettingsBreadcrumbLink(t`Accounts`);

  return (
    <SettingsPageLayout
      title={t`New Account`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        accountsBreadcrumbLink,
        { children: t`New` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsNewAccountSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
