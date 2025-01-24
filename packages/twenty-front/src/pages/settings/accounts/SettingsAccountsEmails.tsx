import { SettingsAccountsMessageChannelsContainer } from '@/settings/accounts/components/SettingsAccountsMessageChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Section } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsAccountsEmails = () => (
  <SubMenuTopBarContainer
    title="Emails"
    links={[
      {
        children: 'User',
        href: getSettingsPath(SettingsPath.ProfilePage),
      },
      {
        children: 'Accounts',
        href: getSettingsPath(SettingsPath.Accounts),
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
