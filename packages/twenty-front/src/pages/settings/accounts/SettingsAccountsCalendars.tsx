import { SettingsAccountsCalendarChannelsContainer } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui';
import { settingsLink } from '~/utils/navigation/settingsLink';

export const SettingsAccountsCalendars = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Calendars`}
      links={[
        {
          children: <Trans>User</Trans>,
          href: settingsLink(SettingsPath.ProfilePage),
        },
        {
          children: <Trans>Accounts</Trans>,
          href: settingsLink(SettingsPath.Accounts),
        },
        { children: <Trans>Calendars</Trans> },
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
