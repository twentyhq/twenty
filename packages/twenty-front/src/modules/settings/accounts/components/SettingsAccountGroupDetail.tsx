import { SettingsAccountConnectionDetails } from '@/settings/accounts/components/SettingsAccountConnectionDetails';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsAccountNativeChannelContent } from '@/settings/accounts/components/SettingsAccountNativeChannelContent';
import { useConnectedAccountAdministration } from '@/settings/accounts/hooks/useConnectedAccountAdministration';
import { useConnectedAccountGroupTabDisplay } from '@/settings/accounts/hooks/useConnectedAccountGroupTabDisplay';
import { useConnectedAccountLabel } from '@/settings/accounts/hooks/useConnectedAccountLabel';
import { useConsolidatedAccountChannels } from '@/settings/accounts/hooks/useConsolidatedAccountChannels';
import { useConsolidatedConnectedAccounts } from '@/settings/accounts/hooks/useConsolidatedConnectedAccounts';
import { getConnectedAccountGroupTabs } from '@/settings/accounts/utils/getConnectedAccountGroupTabs';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Tabs } from 'twenty-ui/primitives/navigation';

const StyledTabList = styled(Tabs.List)`
  overflow-x: auto;
`;
const StyledTabRoot = styled(Tabs.Root)`
  && {
    display: contents;
  }
`;

export const SettingsAccountGroupDetail = () => {
  const { t } = useLingui();
  const { accountGroupId } = useParams<{ accountGroupId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { groups, loading, error, refetch } =
    useConsolidatedConnectedAccounts();
  const group = groups.find(
    (accountGroup) => accountGroup.id === accountGroupId,
  );
  const channels = useConsolidatedAccountChannels(group?.accounts ?? []);
  const { canManageAccount } = useConnectedAccountAdministration();
  const { getTabDisplay } = useConnectedAccountGroupTabDisplay();
  const { getConnectionLabel } = useConnectedAccountLabel();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const tabs = getConnectedAccountGroupTabs({
    accounts: group?.accounts ?? [],
    messageChannels: channels.messageChannels,
    calendarChannels: channels.calendarChannels,
  });
  const requestedTabId = location.hash.slice(1);
  const activeTabId = requestedTabId || tabs[0]?.id;
  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const tabAccounts =
    group?.accounts.filter((account) =>
      activeTab?.connectedAccountIds.includes(account.id),
    ) ?? [];
  const requestedAccountId = searchParams.get('connectedAccountId');
  const account = isDefined(requestedAccountId)
    ? tabAccounts.find((connection) => connection.id === requestedAccountId)
    : (tabAccounts.find(
        (connection) =>
          connection.userWorkspaceId ===
          currentWorkspaceMember?.userWorkspaceId,
      ) ??
      tabAccounts.find(canManageAccount) ??
      tabAccounts[0]);
  const title = group?.handle ?? t`Account`;

  const handleChangeTab = (tabId: unknown) => {
    if (!isString(tabId)) {
      return;
    }
    const nextSearchParams = new URLSearchParams(location.search);

    nextSearchParams.delete('connectedAccountId');
    navigate({ search: nextSearchParams.toString(), hash: `#${tabId}` });
  };
  const handleSelectConnection = (connectedAccountId: string) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.set('connectedAccountId', connectedAccountId);
    navigate({ search: nextSearchParams.toString(), hash: location.hash });
  };

  return (
    <StyledTabRoot value={activeTabId ?? null} onValueChange={handleChangeTab}>
      <SettingsPageLayout
        title={title}
        links={[
          {
            children: t`User`,
            href: getSettingsPath(SettingsPath.ProfilePage),
          },
          {
            children: t`Accounts`,
            href: getSettingsPath(SettingsPath.Accounts),
          },
          { children: title },
        ]}
        secondaryBar={
          tabs.length > 0 ? (
            <StyledTabList aria-label={t`Account apps`} activateOnFocus={false}>
              {tabs.map((tab) => {
                const display = getTabDisplay(tab);

                return (
                  <Tabs.Tab
                    key={tab.id}
                    value={tab.id}
                    startIcon={display.icon}
                  >
                    {display.title}
                  </Tabs.Tab>
                );
              })}
            </StyledTabList>
          ) : undefined
        }
      >
        <SettingsPageContainer>
          {(isDefined(error) || isDefined(channels.error)) && (
            <>
              <InlineBanner
                status="error"
                layout="compact"
              >{t`Account settings could not be loaded.`}</InlineBanner>
              <Button
                variant="outline"
                onClick={() => Promise.all([refetch(), channels.refetch()])}
              >{t`Retry`}</Button>
            </>
          )}
          {loading || (channels.loading && !channels.hasData) ? (
            <SettingsSectionSkeletonLoader />
          ) : !isDefined(group) ? (
            !isDefined(error) && (
              <InlineBanner
                status="error"
                layout="compact"
              >{t`This account does not exist or is not available to you.`}</InlineBanner>
            )
          ) : !isDefined(activeTab) ? (
            channels.loading ? (
              <SettingsSectionSkeletonLoader />
            ) : (
              !isDefined(channels.error) && (
                <InlineBanner
                  status="error"
                  layout="compact"
                >{t`This account's requested app settings are unavailable.`}</InlineBanner>
              )
            )
          ) : (
            <>
              {tabAccounts.length > 1 && (
                <Select
                  label={t`Connection`}
                  dropdownId={`account-connection-${activeTab.id}`}
                  options={tabAccounts.map((connection, index) => ({
                    value: connection.id,
                    label: getConnectionLabel({ account: connection, index }),
                  }))}
                  emptyOption={{ value: '', label: t`Choose a connection` }}
                  value={account?.id ?? ''}
                  onChange={handleSelectConnection}
                  fullWidth
                />
              )}
              {!isDefined(account) ? (
                <InlineBanner
                  status="error"
                  layout="compact"
                >{t`The requested connection is unavailable for this app.`}</InlineBanner>
              ) : (
                <>
                  <SettingsAccountConnectionDetails
                    key={account.id}
                    account={account}
                    groupId={group.id}
                  />
                  {activeTab.type === 'email' && (
                    <SettingsAccountNativeChannelContent
                      key={`email-${account.id}`}
                      account={account}
                      messageChannel={channels.messageChannels.find(
                        (channel) =>
                          channel.connectedAccountId === account.id &&
                          activeTab.channelIds.includes(channel.id),
                      )}
                    />
                  )}
                  {activeTab.type === 'calendar' && (
                    <SettingsAccountNativeChannelContent
                      key={`calendar-${account.id}`}
                      account={account}
                      calendarChannel={channels.calendarChannels.find(
                        (channel) =>
                          channel.connectedAccountId === account.id &&
                          activeTab.channelIds.includes(channel.id),
                      )}
                    />
                  )}
                </>
              )}
            </>
          )}
        </SettingsPageContainer>
      </SettingsPageLayout>
    </StyledTabRoot>
  );
};
