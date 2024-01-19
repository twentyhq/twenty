import { SettingsAccountsConnectedAccountsSection } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsSection';
import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import useI18n from '@/ui/i18n/useI18n';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsAccounts = () => {
  const { translate } = useI18n('translations');
  return (
    <SubMenuTopBarContainer Icon={IconSettings} title={translate('settings')}>
      <SettingsPageContainer>
        <Breadcrumb links={[{ children: translate('accounts') }]} />
        <SettingsAccountsConnectedAccountsSection />
        <SettingsAccountsSettingsSection />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
