import { Breadcrumb, H2Title, IconSettings, Section } from 'twenty-ui';

import { SettingsAccountsMessageChannelsListCard } from '@/settings/accounts/components/SettingsAccountsMessageChannelsListCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';

export const SettingsAccountsEmails = () => (
  <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
    <SettingsPageContainer>
      <Breadcrumb
        links={[
          { children: 'Accounts', href: '/settings/accounts' },
          { children: 'Emails' },
        ]}
      />
      <Section>
        <H2Title
          title="Emails sync"
          description="Sync your inboxes and set your privacy settings"
        />
        <SettingsAccountsMessageChannelsListCard />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
