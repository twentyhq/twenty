import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { isConnectedAccountEligibleForProviderReconnect } from '@/settings/accounts/utils/isConnectedAccountEligibleForProviderReconnect';
import {
  type AccountGroupAction,
  SettingsAccountGroupActionDialog,
} from '@/settings/app-preferences/components/SettingsAccountGroupActionDialog';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { getAppAccountReconnectLabel } from '@/settings/app-preferences/utils/getAppAccountReconnectLabel';
import { getApplicationPreferencesConnectionsPath } from '@/settings/app-preferences/utils/getApplicationPreferencesConnectionsPath';
import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { canReconnectApplicationConnection } from '@/settings/applications/utils/canReconnectApplicationConnection';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconAt,
  IconDotsVertical,
  IconPlayerPlay,
  IconRefresh,
  IconSettings,
  IconTrash,
  IconUnlink,
} from 'twenty-ui/icon';

type SettingsAccountGroupRowDropdownMenuProps = {
  group: ConnectedAccountGroup;
  settingsPath?: string;
};

export const SettingsAccountGroupRowDropdownMenu = ({
  group,
  settingsPath,
}: SettingsAccountGroupRowDropdownMenuProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { triggerProviderReconnect } = useTriggerProviderReconnect();
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { applicationsWithPreferences } = useApplicationsWithPreferences();
  const [accountGroupAction, setAccountGroupAction] =
    useState<AccountGroupAction>();
  const [isActionPending, setIsActionPending] = useState(false);
  const dialogId = `account-group-action-${group.id}`;
  const account = group.builtInAccount;
  const channels = getConnectedAccountSettingsChannels(account);
  const hasPendingConfiguration =
    isDefined(channels.pendingSetupMessageChannel) ||
    isDefined(channels.pendingSetupCalendarChannel);
  const accounts = [
    ...new Map(
      [account, ...group.appAccounts]
        .filter(isDefined)
        .map((connection) => [connection.id, connection]),
    ).values(),
  ];

  const getApplicationName = (connection: ConnectedAccount) => {
    const application = currentWorkspace?.installedApplications.find(
      ({ id }) => id === connection.applicationId,
    );

    return isDefined(application)
      ? getApplicationDisplayName({ application, currentWorkspace })
      : t`Application`;
  };

  const getConnectionLabel = (connection: ConnectedAccount) => {
    if (connection.provider === ConnectedAccountProvider.APP) {
      return `${getApplicationName(connection)}: ${connection.name ?? connection.handle}`;
    }

    const {
      messageChannel,
      calendarChannel,
      pendingSetupMessageChannel,
      pendingSetupCalendarChannel,
    } = getConnectedAccountSettingsChannels(connection);
    const hasEmails =
      isDefined(messageChannel) || isDefined(pendingSetupMessageChannel);
    const hasCalendar =
      isDefined(calendarChannel) || isDefined(pendingSetupCalendarChannel);
    const emailLabel =
      connection.provider === ConnectedAccountProvider.GOOGLE
        ? t`Gmail`
        : connection.provider === ConnectedAccountProvider.MICROSOFT
          ? t`Outlook email`
          : t`IMAP email`;
    const calendarLabel =
      connection.provider === ConnectedAccountProvider.GOOGLE
        ? t`Google Calendar`
        : connection.provider === ConnectedAccountProvider.MICROSOFT
          ? t`Outlook Calendar`
          : t`CalDAV calendar`;

    return (
      [
        hasEmails ? emailLabel : undefined,
        hasCalendar ? calendarLabel : undefined,
      ]
        .filter(isDefined)
        .join(', ') || connection.handle
    );
  };

  const openActionDialog = (action: AccountGroupAction['action']) => {
    if (isActionPending) {
      return;
    }

    setAccountGroupAction({
      action,
      handle: group.handle,
      targets: accounts
        .filter(
          (connection) =>
            action === 'delete' || !isDefined(connection.archivedAt),
        )
        .map((connection) => ({
          id: connection.id,
          label: getConnectionLabel(connection),
        })),
    });
    openDialog(dialogId);
  };

  const providers = applicationsWithPreferences.flatMap(
    ({ connectionProviders }) => connectionProviders,
  );
  const appReconnectActions = group.appAccounts.flatMap((connection) => {
    const provider = providers.find(
      ({ id }) => id === connection.connectionProviderId,
    );

    if (
      !isDefined(provider) ||
      provider.scope !== 'USER' ||
      !canReconnectApplicationConnection({
        connection,
        isClientCredentialsConfigured:
          provider.oauth?.isClientCredentialsConfigured ?? false,
      })
    ) {
      return [];
    }

    return [
      {
        connection,
        provider,
        label: getAppAccountReconnectLabel({
          applicationName: getApplicationName(connection),
          connectionLabel: connection.name ?? connection.handle,
          isLabelledByApplication: accounts.length > 1,
          hasOtherConnectionForApplication: group.appAccounts.some(
            (otherConnection) =>
              otherConnection.id !== connection.id &&
              otherConnection.applicationId === connection.applicationId,
          ),
        }),
      },
    ];
  });

  return (
    <>
      <DropdownRoot type="menu" dropdownId={`settings-account-row-${group.id}`}>
        <Dropdown.Trigger
          render={
            <LightIconButton
              emphasis="subtle"
              aria-label={t`More options`}
              disabled={isActionPending}
            >
              <IconDotsVertical />
            </LightIconButton>
          }
        />
        <DropdownContent side="right" align="start">
          <Dropdown.Section>
            {isDefined(account) && hasPendingConfiguration && (
              <Dropdown.ActionItem
                startIcon={<IconPlayerPlay />}
                render={
                  <Link
                    to={getSettingsPath(SettingsPath.AccountsConfiguration, {
                      connectedAccountId: account.id,
                    })}
                  />
                }
              >{t`Complete setup`}</Dropdown.ActionItem>
            )}
            {isDefined(account) &&
              account.provider ===
                ConnectedAccountProvider.IMAP_SMTP_CALDAV && (
                <Dropdown.ActionItem
                  startIcon={<IconAt />}
                  render={
                    <Link
                      to={getSettingsPath(
                        SettingsPath.EditImapSmtpCaldavConnection,
                        { connectedAccountId: account.id },
                      )}
                    />
                  }
                >{t`Connection settings`}</Dropdown.ActionItem>
              )}
            {isDefined(settingsPath) && (
              <Dropdown.ActionItem
                startIcon={<IconSettings />}
                render={<Link to={settingsPath} />}
              >
                {t`Account settings`}
              </Dropdown.ActionItem>
            )}
            {isDefined(account) &&
              isConnectedAccountEligibleForProviderReconnect(account) && (
                <Dropdown.ActionItem
                  startIcon={<IconRefresh />}
                  onClick={() =>
                    triggerProviderReconnect(account.provider, account.id, {
                      loginHint: account.handle,
                    })
                  }
                >{t`Reconnect`}</Dropdown.ActionItem>
              )}
            {appReconnectActions.map(({ connection, provider, label }) => (
              <Dropdown.ActionItem
                key={connection.id}
                startIcon={<IconRefresh />}
                onClick={() =>
                  triggerAppOAuth({
                    applicationId: provider.applicationId,
                    providerName: provider.name,
                    scope: 'USER',
                    reconnectingConnectedAccountId: connection.id,
                    redirectLocation: getApplicationPreferencesConnectionsPath(
                      provider.applicationId,
                    ),
                  })
                }
              >
                {label}
              </Dropdown.ActionItem>
            ))}
            {accounts.some(({ archivedAt }) => !isDefined(archivedAt)) && (
              <Dropdown.ActionItem
                startIcon={<IconUnlink />}
                onClick={() => openActionDialog('disconnect')}
              >
                {t`Disconnect account`}
              </Dropdown.ActionItem>
            )}
            <Dropdown.ActionItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={() => openActionDialog('delete')}
            >
              {t`Delete account and synced data`}
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
      {isDefined(accountGroupAction) && (
        <SettingsAccountGroupActionDialog
          dialogId={dialogId}
          accountGroupAction={accountGroupAction}
          isPending={isActionPending}
          onPendingChange={setIsActionPending}
        />
      )}
    </>
  );
};
