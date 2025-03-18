import { SettingsAccountsMessageChannelsContainer } from '@/settings/accounts/components/SettingsAccountsMessageChannelsContainer';
import { SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountMessageChannelsTabListComponentId';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { ActiveTabComponentInstanceContext } from '@/ui/layout/tab/states/contexts/ActiveTabComponentInstanceContext';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsAccountsEmails = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Emails`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Accounts`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: t`Emails` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <ActiveTabComponentInstanceContext.Provider
            value={{
              instanceId:
                SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID,
            }}
          >
            <SettingsAccountsMessageChannelsContainer />
          </ActiveTabComponentInstanceContext.Provider>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
