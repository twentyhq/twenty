import { SettingsAccountsMessageChannelsContainer } from '@/settings/accounts/components/SettingsAccountsMessageChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { IconMail } from 'twenty-ui';

export const SettingsAccountsEmails = () => (
  <SubMenuTopBarContainer
    Icon={IconMail}
    title={
      <Breadcrumb
        links={[
          { children: 'Accounts', href: '/settings/accounts' },
          { children: 'Emails' },
        ]}
      />
    }
  >
    <SettingsPageContainer>
      <Section>
        <SettingsAccountsMessageChannelsContainer />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
