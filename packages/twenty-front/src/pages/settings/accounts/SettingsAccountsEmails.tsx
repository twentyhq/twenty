import { SettingsAccountsMessageChannelsContainer } from '@/settings/accounts/components/SettingsAccountsMessageChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Section } from 'twenty-ui';
import { settingsLink } from '~/utils/navigation/settingsLink';

export const SettingsAccountsEmails = () => (
  <SubMenuTopBarContainer
    title="Emails"
    links={[
      {
        children: 'User',
        href: settingsLink(SettingsPath.ProfilePage),
      },
      {
        children: 'Accounts',
        href: settingsLink(SettingsPath.Ac  counts),
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
