import { useParams } from 'react-router-dom';

import { SettingsAccountsToggleSettingCard } from '@/settings/accounts/components/SettingsAccountsToggleSettingCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconRefresh, IconSettings, IconUser } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { mockedConnectedAccounts } from '~/testing/mock-data/accounts';

export const SettingsAccountsCalendarsSettings = () => {
  const { accountUuid = '' } = useParams();
  const connectedAccount = mockedConnectedAccounts.find(
    ({ id }) => id === accountUuid,
  );

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <Breadcrumb
          links={[
            {
              children: 'Accounts',
              href: getSettingsPagePath(SettingsPath.Accounts),
            },
            {
              children: 'Calendars',
              href: getSettingsPagePath(SettingsPath.AccountsCalendars),
            },
            { children: connectedAccount?.handle || '' },
          ]}
        />
        <Section>
          <H2Title
            title="Contact auto-creation"
            description="Automatically create contacts for people you've participated in an event with."
          />
          <SettingsAccountsToggleSettingCard
            Icon={IconUser}
            title="Auto-creation"
            isEnabled={false}
            onToggle={() => {}}
          />
        </Section>
        <Section>
          <H2Title
            title="Synchronization"
            description="Past and future calendar events will automatically be synced to this workspace"
          />
          <SettingsAccountsToggleSettingCard
            Icon={IconRefresh}
            title="Sync events"
            isEnabled={false}
            onToggle={() => {}}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
