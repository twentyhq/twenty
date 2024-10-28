import { SettingsAccountsMessageChannelsContainer } from '@/settings/accounts/components/SettingsAccountsMessageChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Section } from 'twenty-ui';

export const SettingsAccountsEmails = () => (
  <SubMenuTopBarContainer
    title="Emails"
    links={[
      {
        children: 'User',
        href: getSettingsPagePath(SettingsPath.ProfilePage),
      },
      {
        children: 'Accounts',
        href: getSettingsPagePath(SettingsPath.Accounts),
      },
      { children: 'Emails' },
    ]}
  >
    <SettingsPageContainer>
      <Section>
        <SettingsAccountsMessageChannelsContainer />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
