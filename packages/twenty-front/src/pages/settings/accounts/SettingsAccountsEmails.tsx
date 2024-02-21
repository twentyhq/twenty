import { SettingsAccountsEmailsSyncSection } from '@/settings/accounts/components/SettingsAccountsEmailsSyncSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import useI18n from '@/ui/i18n/useI18n';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsAccountsEmails = () => {
  const { translate } = useI18n('translations');

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title={translate('settings')}>
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            { children: translate('accounts'), href: '/settings/accounts' },
            { children: translate('emails') },
          ]}
        />
        <SettingsAccountsEmailsSyncSection />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
}
