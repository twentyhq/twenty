import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { isConnectedAccountEligibleForProviderReconnect } from '@/settings/accounts/utils/isConnectedAccountEligibleForProviderReconnect';
import { SettingsAccountGroupActionDialogSubtitle } from '@/settings/app-preferences/components/SettingsAccountGroupActionDialogSubtitle';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useRunAccountGroupAction } from '@/settings/app-preferences/hooks/useRunAccountGroupAction';
import { type AccountGroupAction } from '@/settings/app-preferences/types/AccountGroupAction';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { getAppAccountReconnectLabel } from '@/settings/app-preferences/utils/getAppAccountReconnectLabel';
import { getApplicationPreferencesConnectionsPath } from '@/settings/app-preferences/utils/getApplicationPreferencesConnectionsPath';
import { getBuiltInAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getBuiltInAccountAppsUsingAccount';
import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import { getInstalledApplicationDisplayName } from '@/settings/app-preferences/utils/getInstalledApplicationDisplayName';
import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { canReconnectApplicationConnection } from '@/settings/applications/utils/canReconnectApplicationConnection';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
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
  const { isActionPending, runAccountGroupAction } = useRunAccountGroupAction();
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

  const getApplicationName = (connection: ConnectedAccount) =>
    getInstalledApplicationDisplayName({
      applicationId: connection.applicationId,
      currentWorkspace,
    });

  const getConnectionLabel = (connection: ConnectedAccount) => {
    if (connection.provider === ConnectedAccountProvider.APP) {
      const applicationName = getApplicationName(connection);
      const connectionName = connection.name ?? connection.handle;

      return t`${applicationName}: ${connectionName}`;
    }

    const builtInAccountAppNames = getBuiltInAccountAppsUsingAccount(
      connection,
    ).map((app) => t(app.name));

    if (!isNonEmptyArray(builtInAccountAppNames)) {
      return connection.handle;
    }

    return builtInAccountAppNames.join(', ');
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
        canStartAuthorization:
          canStartConnectionProviderAuthorization(provider),
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
        <ConfirmationDialog
          dialogId={dialogId}
          loading={isActionPending}
          title={
            accountGroupAction.action === 'disconnect'
              ? t`Disconnect account`
              : t`Delete account and synced data?`
          }
          subtitle={
            <SettingsAccountGroupActionDialogSubtitle
              accountGroupAction={accountGroupAction}
            />
          }
          onConfirmClick={() => runAccountGroupAction(accountGroupAction)}
          confirmButtonText={
            accountGroupAction.action === 'disconnect'
              ? t`Disconnect account`
              : t`Delete account and data`
          }
          shouldWaitForConfirmBeforeClosing
        />
      )}
    </>
  );
};
