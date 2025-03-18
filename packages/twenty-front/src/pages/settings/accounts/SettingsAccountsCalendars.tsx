import { SettingsAccountsCalendarChannelsContainer } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsContainer';
import { SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountCalendarChannelsTabListComponentId';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ActiveTabComponentInstanceContext } from '@/ui/layout/tab/states/contexts/ActiveTabComponentInstanceContext';
import { Trans, useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsAccountsCalendars = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
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
          <ActiveTabComponentInstanceContext.Provider
            value={{
              instanceId:
                SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID,
            }}
          >
            <SettingsAccountsCalendarChannelsContainer />
          </ActiveTabComponentInstanceContext.Provider>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
