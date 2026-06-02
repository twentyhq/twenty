import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountsCalendarChannelsContainer } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsContainer';
import { SettingsAccountsConnectedAccountsListCard } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsListCard';
import { SettingsAccountsMessageChannelsContainer } from '@/settings/accounts/components/SettingsAccountsMessageChannelsContainer';
import { SettingsAccountsSettingsSection } from '@/settings/accounts/components/SettingsAccountsSettingsSection';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  H2Title,
  IconCalendarEvent,
  IconMail,
  IconSettings,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

const SETTINGS_ACCOUNTS_TABS_INSTANCE_ID = 'settings-accounts-tabs';

// Tab ids double as URL hashes (#emails, #calendars), so SettingsPath.AccountsEmails
// and AccountsCalendars deep-link straight to the matching tab via hash sync.
const ACCOUNTS_TAB_GENERAL = 'general';
const ACCOUNTS_TAB_EMAILS = 'emails';
const ACCOUNTS_TAB_CALENDARS = 'calendars';

export const SettingsAccounts = () => {
  const { t } = useLingui();

  const { accounts: allAccounts, loading } = useMyConnectedAccounts();

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_ACCOUNTS_TABS_INSTANCE_ID,
  );

  const tabs = [
    { id: ACCOUNTS_TAB_GENERAL, title: t`General`, Icon: IconSettings },
    { id: ACCOUNTS_TAB_EMAILS, title: t`Emails`, Icon: IconMail },
    {
      id: ACCOUNTS_TAB_CALENDARS,
      title: t`Calendars`,
      Icon: IconCalendarEvent,
    },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case ACCOUNTS_TAB_EMAILS:
        return (
          <Section>
            <SettingsAccountsMessageChannelsContainer />
          </Section>
        );
      case ACCOUNTS_TAB_CALENDARS:
        return (
          <Section>
            <SettingsAccountsCalendarChannelsContainer />
          </Section>
        );
      default:
        return loading ? (
          <SettingsSectionSkeletonLoader />
        ) : (
          <>
            <Section>
              <H2Title
                title={t`Connected accounts`}
                description={t`Manage your internet accounts.`}
              />
              <SettingsAccountsConnectedAccountsListCard
                accounts={allAccounts}
              />
            </Section>
            <SettingsAccountsBlocklistSection />
            <SettingsAccountsSettingsSection />
          </>
        );
    }
  };

  return (
    <SettingsPageLayout
      title={t`Account`}
      secondaryBar={
        <SettingsTabBar
          tabs={tabs}
          componentInstanceId={SETTINGS_ACCOUNTS_TABS_INSTANCE_ID}
        />
      }
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: t`Account` },
      ]}
    >
      <SettingsPageContainer>{renderActiveTabContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
