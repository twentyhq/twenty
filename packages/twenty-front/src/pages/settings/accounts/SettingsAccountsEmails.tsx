import { SettingsAccountsEmailsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsEmailsBlocklistSection';
import { SettingsAccountsEmailsSyncSection } from '@/settings/accounts/components/SettingsAccountsEmailsSyncSection';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

export const SettingsAccountsEmails = () => (
  <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
    <SettingsPageContainer>
      <Breadcrumb
        links={[
          { children: 'Accounts', href: '/settings/accounts' },
          { children: 'Emails' },
        ]}
      />
      <SettingsAccountsEmailsSyncSection />
      <SettingsAccountsEmailsBlocklistSection />
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
