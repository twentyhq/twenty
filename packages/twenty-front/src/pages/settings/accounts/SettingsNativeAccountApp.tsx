import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountGroupsSection } from '@/settings/app-preferences/components/SettingsAccountGroupsSection';
import { SettingsAccountsBlocklistSection } from '@/settings/accounts/components/SettingsAccountsBlocklistSection';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SettingsAppPreferencesSelectedMessageChannelDetails } from '~/pages/settings/accounts/SettingsAppPreferencesSelectedMessageChannelDetails';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SETTINGS_NATIVE_ACCOUNT_APP_TAB_LIST_COMPONENT_ID } from '@/settings/app-preferences/constants/SettingsNativeAccountAppTabListComponentId';
import { useEnabledNativeAccountApps } from '@/settings/app-preferences/hooks/useEnabledNativeAccountApps';
import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { Select } from '@/ui/input/components/Select';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconCalendarEvent, IconMail, IconSettings } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SettingsNativeAccountApp = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { nativeAccountAppId } = useParams<{ nativeAccountAppId: string }>();
  const { enabledNativeAccountApps } = useEnabledNativeAccountApps();
  const app = enabledNativeAccountApps.find(
    (enabledApp) => enabledApp.id === nativeAccountAppId,
  );
  const { groups, loading } = useMyAccountGroups();
  const [selectedAccountId, setSelectedAccountId] = useState<string>();

  const isInitialLoading = loading && groups.length === 0;
  const tabListComponentInstanceId = `${SETTINGS_NATIVE_ACCOUNT_APP_TAB_LIST_COMPONENT_ID}-${nativeAccountAppId}`;

  const providerAccounts = groups
    .map((group) => group.nativeAccount)
    .filter(isDefined)
    .filter((account) => account.provider === app?.provider);
  const emailAccounts =
    app?.hasEmails === true
      ? providerAccounts.filter((account) =>
          isDefined(
            getConnectedAccountSettingsChannels(account).messageChannel,
          ),
        )
      : [];
  const calendarAccounts =
    app?.hasCalendar === true
      ? providerAccounts.filter((account) =>
          isDefined(
            getConnectedAccountSettingsChannels(account).calendarChannel,
          ),
        )
      : [];

  const tabs = [
    { id: 'general', title: t`General`, Icon: IconSettings },
    emailAccounts.length > 0
      ? { id: 'emails', title: t`Emails`, Icon: IconMail }
      : undefined,
    calendarAccounts.length > 0
      ? { id: 'calendar', title: t`Calendar`, Icon: IconCalendarEvent }
      : undefined,
  ].filter(isDefined);

  const activeTabId = useSettingsActiveTabId(
    tabListComponentInstanceId,
    tabs.map((tab) => tab.id),
  );

  if (!isAppPreferencesEnabled || !isDefined(app)) {
    return <Navigate to={getSettingsPath(SettingsPath.Accounts)} replace />;
  }

  const appName = t(app.name);

  const getSelectedAccount = (accounts: ConnectedAccount[]) =>
    accounts.find((account) => account.id === selectedAccountId) ?? accounts[0];

  const renderAccountSelect = (
    accounts: ConnectedAccount[],
    selectedAccount: ConnectedAccount,
  ) => (
    <Select
      dropdownId="settings-native-account-app-account"
      label={t`Account`}
      fullWidth
      value={selectedAccount.id}
      options={accounts.map((account) => ({
        value: account.id,
        label: account.handle,
        Icon: SettingsConnectedAccountIcon({ account }),
      }))}
      onChange={setSelectedAccountId}
    />
  );

  const renderContent = () => {
    if (isInitialLoading) {
      return <SettingsSectionSkeletonLoader />;
    }

    if (activeTabId === 'emails') {
      const selectedAccount = getSelectedAccount(emailAccounts);
      const { messageChannel } =
        getConnectedAccountSettingsChannels(selectedAccount);

      return (
        <>
          {renderAccountSelect(emailAccounts, selectedAccount)}
          {isDefined(messageChannel) && (
            <SettingsAppPreferencesSelectedMessageChannelDetails
              messageChannel={messageChannel}
            />
          )}
        </>
      );
    }

    if (activeTabId === 'calendar') {
      const selectedAccount = getSelectedAccount(calendarAccounts);
      const { calendarChannel } =
        getConnectedAccountSettingsChannels(selectedAccount);

      return (
        <>
          {renderAccountSelect(calendarAccounts, selectedAccount)}
          {isDefined(calendarChannel) && (
            <SettingsAccountsCalendarChannelDetails
              calendarChannel={calendarChannel}
            />
          )}
        </>
      );
    }

    return (
      <>
        <SettingsAccountGroupsSection nativeAccountApp={app} />
        <SettingsAccountsBlocklistSection />
      </>
    );
  };

  return (
    <SettingsPageLayout
      title={appName}
      icon={<app.Icon size={theme.icon.size.md} />}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`App preferences`,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: appName },
      ]}
      secondaryBar={
        isInitialLoading ? undefined : (
          <SettingsTabBar
            aria-label={t`${appName} preferences`}
            tabs={tabs}
            componentInstanceId={tabListComponentInstanceId}
          />
        )
      }
    >
      <SettingsPageContainer>{renderContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
