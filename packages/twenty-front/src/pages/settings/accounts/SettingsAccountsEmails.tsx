import { Breadcrumb, H2Title } from 'twenty-ui';

import { SettingsAccountsMessageChannelsListCard } from '@/settings/accounts/components/SettingsAccountsMessageChannelsListCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconSettings } from '@/ui/display/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

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
