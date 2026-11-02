import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SETTINGS_APP_PREFERENCES_TAB_IDS } from '@/settings/app-preferences/constants/SettingsAppPreferencesTabIds';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SETTINGS_ACCOUNT_GROUP_TAB_LIST_COMPONENT_ID } from '@/settings/app-preferences/constants/SettingsAccountGroupTabListComponentId';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import { SettingsApplicationCustomSettingsSection } from '@/settings/applications/components/SettingsApplicationCustomSettingsSection';
import { getSettingsMenuItemTabId } from '@/settings/applications/utils/getSettingsMenuItemTabId';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconCalendarEvent, IconMail } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { useTheme } from 'twenty-ui/theme';
import { SettingsAppPreferencesSelectedMessageChannelDetails } from '~/pages/settings/accounts/SettingsAppPreferencesSelectedMessageChannelDetails';

export const SettingsAccountDetail = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { connectedAccountId } = useParams<{ connectedAccountId: string }>();
  const { groups, loading } = useMyAccountGroups();
  const {
    applicationsWithPreferences,
    loading: applicationsWithPreferencesLoading,
  } = useApplicationsWithPreferences();
  const tabListComponentInstanceId = `${SETTINGS_ACCOUNT_GROUP_TAB_LIST_COMPONENT_ID}-${connectedAccountId}`;

  const group = groups.find(
    (candidate) => candidate.builtInAccount?.id === connectedAccountId,
  );
  const builtInAccount = group?.builtInAccount;
  const { messageChannel, calendarChannel } =
    getConnectedAccountSettingsChannels(builtInAccount);

  const connectedApplicationIds = new Set(
    (group?.appAccounts ?? [])
      .map((appAccount) => appAccount.applicationId)
      .filter(isDefined),
  );

  const applicationSettingsTabs = applicationsWithPreferences
    .filter(({ application }) => connectedApplicationIds.has(application.id))
    .flatMap(({ application, settingsMenuItems }) => {
      const applicationName = getApplicationDisplayName({
        application,
        currentWorkspace,
      });

      return settingsMenuItems.map((settingsMenuItem) => {
        const settingsMenuItemTitle = settingsMenuItem.title;

        return {
          frontComponentId: settingsMenuItem.frontComponentId,
          tab: {
            id: getSettingsMenuItemTabId(settingsMenuItem),
            title:
              settingsMenuItems.length > 1
                ? t`${applicationName}: ${settingsMenuItemTitle}`
                : applicationName,
            Icon: getIcon(settingsMenuItem.icon, 'IconAdjustments'),
          },
        };
      });
    });

  const tabs = [
    isDefined(messageChannel)
      ? { id: 'emails', title: t`Emails`, Icon: IconMail }
      : undefined,
    isDefined(calendarChannel)
      ? { id: 'calendar', title: t`Calendar`, Icon: IconCalendarEvent }
      : undefined,
    ...applicationSettingsTabs.map(({ tab }) => tab),
  ].filter(isDefined);

  const activeTabId = useSettingsActiveTabId(
    tabListComponentInstanceId,
    tabs.map((tab) => tab.id),
  );

  const activeApplicationSettingsTab = applicationSettingsTabs.find(
    ({ tab }) => tab.id === activeTabId,
  );

  if (!loading && !applicationsWithPreferencesLoading && tabs.length === 0) {
    return (
      <Navigate to={getSettingsPath(SettingsPath.AppPreferences)} replace />
    );
  }

  if (!isDefined(builtInAccount)) {
    return <SettingsSkeletonLoader />;
  }

  const ProviderIcon = SettingsConnectedAccountIcon({
    account: builtInAccount,
  });

  const renderContent = () => {
    if (activeTabId === 'emails' && isDefined(messageChannel)) {
      return (
        <SettingsAppPreferencesSelectedMessageChannelDetails
          messageChannel={messageChannel}
        />
      );
    }

    if (activeTabId === 'calendar' && isDefined(calendarChannel)) {
      return (
        <SettingsAccountsCalendarChannelDetails
          calendarChannel={calendarChannel}
        />
      );
    }

    if (isDefined(activeApplicationSettingsTab)) {
      return (
        <SettingsApplicationCustomSettingsSection
          frontComponentId={activeApplicationSettingsTab.frontComponentId}
        />
      );
    }

    return <SettingsSectionSkeletonLoader />;
  };

  return (
    <SettingsPageLayout
      title={builtInAccount.handle}
      icon={<ProviderIcon size={theme.icon.size.md} />}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Apps preferences`,
          href: getSettingsPath(
            SettingsPath.AppPreferences,
            undefined,
            undefined,
            SETTINGS_APP_PREFERENCES_TAB_IDS.ACCOUNTS,
          ),
        },
        { children: builtInAccount.handle },
      ]}
      secondaryBar={
        tabs.length > 0 ? (
          <SettingsTabBar
            aria-label={t`Account settings`}
            tabs={tabs}
            componentInstanceId={tabListComponentInstanceId}
          />
        ) : undefined
      }
    >
      <SettingsPageContainer>{renderContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
