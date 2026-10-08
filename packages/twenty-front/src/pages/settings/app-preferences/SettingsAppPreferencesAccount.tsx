import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SettingsAccountsConnectionStatus } from '@/settings/accounts/components/SettingsAccountsConnectionStatus';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { SettingsAppPreferencesMessageChannelContent } from '@/settings/app-preferences/components/SettingsAppPreferencesMessageChannelContent';
import { useBuiltInApps } from '@/settings/app-preferences/hooks/useBuiltInApps';
import { useMyAppPreferencesConnectedAccounts } from '@/settings/app-preferences/hooks/useMyAppPreferencesConnectedAccounts';
import { getAccountPreferenceChannels } from '@/settings/app-preferences/utils/getAccountPreferenceChannels';
import { isAccountUsedByBuiltInApp } from '@/settings/app-preferences/utils/isAccountUsedByBuiltInApp';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { Link, useLocation, useParams } from 'react-router-dom';
import { MessageChannelType, SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconAt, IconCalendarEvent, IconMail } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useTheme } from 'twenty-ui/theme';
import { SettingsAppPreferencesApplication } from '~/pages/settings/app-preferences/SettingsAppPreferencesApplication';

export const SettingsAppPreferencesAccount = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { connectedAccountId } = useParams<{ connectedAccountId: string }>();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const location = useLocation();
  const { builtInApps } = useBuiltInApps();
  const {
    accounts,
    loading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useMyConnectedAccounts(connectedAccountId);
  const {
    accounts: appAccounts,
    loading: appAccountsLoading,
    error: appAccountsError,
    refetch: refetchAppAccounts,
  } = useMyAppPreferencesConnectedAccounts();
  const account = accounts.find(({ id }) => id === connectedAccountId);
  const appAccount = appAccounts.find(({ id }) => id === connectedAccountId);

  if (isDefined(appAccount)) {
    return <SettingsAppPreferencesApplication connectedAccount={appAccount} />;
  }

  if (!isDefined(account) || accountsLoading || isDefined(accountsError)) {
    const loading = accountsLoading || appAccountsLoading;
    const hasError = isDefined(accountsError) || isDefined(appAccountsError);

    return (
      <SettingsPageLayout
        title={account?.handle ?? t`Account preferences`}
        icon={<IconAt size={theme.icon.size.md} />}
        links={[
          {
            children: t`Apps`,
            href: getSettingsPath(SettingsPath.AppPreferences),
          },
          { children: account?.handle ?? t`Account preferences` },
        ]}
      >
        <SettingsPageContainer>
          {loading ? (
            <SettingsSectionSkeletonLoader />
          ) : (
            <InlineBanner
              variant="compact"
              color={hasError ? 'danger' : 'blue'}
              message={
                hasError
                  ? t`Unable to load account preferences.`
                  : t`This account is no longer available or you do not have access to it.`
              }
              button={
                hasError
                  ? {
                      title: t`Retry`,
                      onClick: () =>
                        Promise.allSettled([
                          refetchAccounts(),
                          refetchAppAccounts(),
                        ]),
                    }
                  : undefined
              }
            />
          )}
        </SettingsPageContainer>
      </SettingsPageLayout>
    );
  }

  const appsUsingAccount = builtInApps.filter((builtInApp) =>
    isAccountUsedByBuiltInApp({ account, builtInApp }),
  );
  const messagingApp = account.messageChannels.some(
    (channel) => channel.type === MessageChannelType.EMAIL,
  )
    ? appsUsingAccount.find((application) => application.hasMessaging)
    : undefined;
  const calendarApp = isNonEmptyArray(account.calendarChannels)
    ? appsUsingAccount.find((application) => application.hasCalendar)
    : undefined;
  const tabs = [
    ...(isDefined(messagingApp)
      ? [{ id: 'emails', title: t`Emails`, Icon: IconMail }]
      : []),
    ...(isDefined(calendarApp)
      ? [{ id: 'calendar', title: t`Calendar`, Icon: IconCalendarEvent }]
      : []),
  ];
  const requestedTabId = location.hash.replace('#', '');
  const activeTabId = tabs.some(({ id }) => id === requestedTabId)
    ? requestedTabId
    : tabs[0]?.id;
  const selectedApp = activeTabId === 'emails' ? messagingApp : calendarApp;
  const { messageChannels, calendarChannels } =
    getAccountPreferenceChannels(account);
  const messageChannel = messageChannels[0];
  const calendarChannel = calendarChannels[0];
  const isArchived = isDefined(account.archivedAt);
  const isCalendarOwner =
    isDefined(currentWorkspaceMember?.userWorkspaceId) &&
    account.userWorkspaceId === currentWorkspaceMember.userWorkspaceId;
  const hasPreferenceChannel =
    activeTabId === 'emails'
      ? isDefined(messageChannel)
      : isDefined(calendarChannel);
  const ProviderIcon = SettingsConnectedAccountIcon({ account });
  const appPreferencesPath = isDefined(selectedApp)
    ? `${getSettingsPath(SettingsPath.AppPreferencesBuiltInApplication, { builtInAppId: selectedApp.id })}?${new URLSearchParams({ connectedAccountId: account.id })}#${isArchived || !hasPreferenceChannel || (activeTabId === 'calendar' && !isCalendarOwner) ? 'general' : activeTabId === 'emails' ? 'messaging' : 'calendar'}`
    : getSettingsPath(SettingsPath.AppPreferences);

  return (
    <SettingsPageLayout
      title={account.handle}
      icon={<ProviderIcon size={theme.icon.size.md} />}
      links={[
        {
          children: t`Apps`,
          href: getSettingsPath(SettingsPath.AppPreferences),
        },
        { children: account.handle },
      ]}
      tag={
        isArchived ? (
          <SettingsAccountsConnectionStatus account={account} />
        ) : undefined
      }
      actionButton={
        <Button
          href={appPreferencesPath}
          render={<Link to={appPreferencesPath} />}
          variant="outline"
          size="sm"
        >
          {isDefined(selectedApp)
            ? t`${selectedApp.name} preferences`
            : t`App preferences`}
        </Button>
      }
      secondaryBar={
        tabs.length > 0 ? (
          <SettingsTabBar
            aria-label={t`Account preferences tabs`}
            componentInstanceId={`app-preferences-account-${account.id}`}
            tabs={tabs}
            selectedTabId={activeTabId}
          />
        ) : undefined
      }
    >
      <SettingsPageContainer>
        {isArchived ? (
          <InlineBanner
            variant="compact"
            color="blue"
            message={t`This account is disconnected. Reconnect it in app preferences to continue syncing.`}
          />
        ) : !isDefined(activeTabId) ? (
          <InlineBanner
            variant="compact"
            color="blue"
            message={t`No apps are using this account.`}
          />
        ) : !hasPreferenceChannel ? (
          <InlineBanner
            variant="compact"
            color="blue"
            message={t`Preferences are unavailable until this account is configured and syncing.`}
          />
        ) : activeTabId === 'emails' && isDefined(messageChannel) ? (
          <SettingsAppPreferencesMessageChannelContent
            key={messageChannel.id}
            messageChannel={messageChannel}
            connectedAccount={account}
          />
        ) : activeTabId === 'calendar' && !isCalendarOwner ? (
          <InlineBanner
            variant="compact"
            color="blue"
            message={t`Calendar preferences for this shared account are managed by its owner.`}
          />
        ) : (
          isDefined(calendarChannel) && (
            <SettingsAccountsCalendarChannelDetails
              key={calendarChannel.id}
              calendarChannel={calendarChannel}
            />
          )
        )}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
