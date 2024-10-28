import { SettingsAccountsCalendarChannelsContainer } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Section } from 'twenty-ui';

export const SettingsAccountsCalendars = () => {
  return (
    <SubMenuTopBarContainer
      title="Calendars"
      links={[
        {
          children: 'User',
          href: getSettingsPagePath(SettingsPath.ProfilePage),
        },
        {
          children: 'Accounts',
          href: getSettingsPagePath(SettingsPath.Accounts),
        },
        { children: 'Calendars' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsAccountsCalendarChannelsContainer />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
