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
import { SETTINGS_ACCOUNTS_TABS } from '~/pages/settings/accounts/constants/SettingsAccountsTabs';

export const SettingsAccounts = () => {
  const { t } = useLingui();
  const { accounts: allAccounts, loading } = useMyConnectedAccounts();

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_ACCOUNTS_TABS.COMPONENT_INSTANCE_ID,
  );
  const activeTab = activeTabId ?? SETTINGS_ACCOUNTS_TABS.TABS_IDS.GENERAL;

  const tabs = [
    {
      id: SETTINGS_ACCOUNTS_TABS.TABS_IDS.GENERAL,
      title: t`General`,
      Icon: IconSettings,
    },
    {
      id: SETTINGS_ACCOUNTS_TABS.TABS_IDS.EMAILS,
      title: t`Emails`,
      Icon: IconMail,
    },
    {
      id: SETTINGS_ACCOUNTS_TABS.TABS_IDS.CALENDARS,
      title: t`Calendars`,
      Icon: IconCalendarEvent,
    },
  ];

  return (
    <SettingsPageLayout
      title={t`Account`}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: t`Account` },
      ]}
      secondaryBar={
        <SettingsTabBar
          tabs={tabs}
          componentInstanceId={SETTINGS_ACCOUNTS_TABS.COMPONENT_INSTANCE_ID}
        />
      }
    >
      <SettingsPageContainer>
        {loading ? (
          <SettingsSectionSkeletonLoader />
        ) : (
          <>
            {activeTab === SETTINGS_ACCOUNTS_TABS.TABS_IDS.GENERAL && (
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
            )}
            {activeTab === SETTINGS_ACCOUNTS_TABS.TABS_IDS.EMAILS && (
              <Section>
                <SettingsAccountsMessageChannelsContainer />
              </Section>
            )}
            {activeTab === SETTINGS_ACCOUNTS_TABS.TABS_IDS.CALENDARS && (
              <Section>
                <SettingsAccountsCalendarChannelsContainer />
              </Section>
            )}
          </>
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
