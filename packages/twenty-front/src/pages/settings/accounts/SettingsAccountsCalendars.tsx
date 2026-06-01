import { SettingsAccountsCalendarChannelsContainer } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';

export const SettingsAccountsCalendars = () => {
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={t`Calendars`}
      links={[
        {
          children: <Trans>User</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: <Trans>Accounts</Trans>,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: <Trans>Calendars</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <SettingsAccountsCalendarChannelsContainer />
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
