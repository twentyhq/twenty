import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  SettingsPath,
} from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { SettingsAccountGroupActionTargetList } from '@/settings/app-preferences/components/SettingsAccountGroupActionTargetList';
import { useRunAccountGroupAction } from '@/settings/app-preferences/hooks/useRunAccountGroupAction';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { type ConnectedAccountGroup } from '@/settings/app-preferences/types/ConnectedAccountGroup';
import { getAccountGroupActionTargets } from '@/settings/app-preferences/utils/getAccountGroupActionTargets';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  IconAt,
  IconDotsVertical,
  IconPlayerPlay,
  IconRefresh,
  IconTrash,
  IconUnlink,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Link, useLocation } from 'react-router-dom';
import { isConnectedAccountEligibleForProviderReconnect } from '@/settings/accounts/utils/isConnectedAccountEligibleForProviderReconnect';

type SettingsAppPreferencesRowDropdownMenuProps = {
  group: ConnectedAccountGroup;
  hasAccountSettings: boolean;
  builtInAccountApp?: BuiltInAccountApp;
};

export const SettingsAppPreferencesRowDropdownMenu = ({
  group,
  hasAccountSettings,
  builtInAccountApp,
}: SettingsAppPreferencesRowDropdownMenuProps) => {
  const { builtInAccount } = group;
  const dropdownId = `settings-account-row-${group.id}`;
  const deleteAccountModalId = `delete-account-modal-${group.id}`;
  const disconnectAccountModalId = `disconnect-account-modal-${group.id}`;

  const { t } = useLingui();
  const { openDialog } = useDialog();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const { runAccountGroupAction } = useRunAccountGroupAction();
  const { triggerProviderReconnect } = useTriggerProviderReconnect();
  const { pathname, hash } = useLocation();

  const disconnectTargets = getAccountGroupActionTargets({
    group,
    action: 'disconnect',
    currentWorkspace,
  });
  const deleteTargets = getAccountGroupActionTargets({
    group,
    action: 'delete',
    currentWorkspace,
  });

  const hasPendingConfiguration =
    isDefined(builtInAccount) &&
    (builtInAccount.messageChannels.some(
      (channel) =>
        channel.syncStage === MessageChannelSyncStage.PENDING_CONFIGURATION,
    ) ||
      builtInAccount.calendarChannels.some(
        (channel) =>
          channel.syncStage === CalendarChannelSyncStage.PENDING_CONFIGURATION,
      ));

  return (
    <>
      <DropdownRoot type="menu" dropdownId={dropdownId}>
        <Dropdown.Trigger
          render={
            <LightIconButton emphasis="subtle" aria-label={t`More options`}>
              <IconDotsVertical />
            </LightIconButton>
          }
        />
        <DropdownContent side="right" align="start">
          <Dropdown.Section>
            {hasAccountSettings && (
              <Dropdown.ActionItem
                startIcon={<IconAt />}
                render={
                  <Link
                    to={getSettingsPath(SettingsPath.AccountDetail, {
                      connectedAccountId: group.id,
                    })}
                  />
                }
              >{t`Account settings`}</Dropdown.ActionItem>
            )}
            {hasPendingConfiguration && (
              <Dropdown.ActionItem
                startIcon={<IconPlayerPlay />}
                render={
                  <Link
                    to={getSettingsPath(SettingsPath.AccountsConfiguration, {
                      connectedAccountId: builtInAccount.id,
                    })}
                  />
                }
              >{t`Complete setup`}</Dropdown.ActionItem>
            )}
            {isDefined(builtInAccount) &&
              builtInAccount.provider ===
                ConnectedAccountProvider.IMAP_SMTP_CALDAV && (
                <Dropdown.ActionItem
                  startIcon={<IconAt />}
                  render={
                    <Link
                      to={getSettingsPath(
                        SettingsPath.EditImapSmtpCaldavConnection,
                        {
                          connectedAccountId: builtInAccount.id,
                        },
                      )}
                    />
                  }
                >{t`Connection settings`}</Dropdown.ActionItem>
              )}
            {isDefined(builtInAccountApp) &&
              isDefined(builtInAccount) &&
              isConnectedAccountEligibleForProviderReconnect(
                builtInAccount,
              ) && (
                <Dropdown.ActionItem
                  startIcon={<IconRefresh />}
                  onClick={() => {
                    triggerProviderReconnect(
                      builtInAccount.provider,
                      builtInAccount.id,
                      {
                        loginHint: builtInAccount.handle,
                        redirectLocation: `${pathname}${hash}`,
                      },
                    );
                  }}
                >{t`Reconnect`}</Dropdown.ActionItem>
              )}
            {isNonEmptyArray(disconnectTargets) && (
              <Dropdown.ActionItem
                startIcon={<IconUnlink />}
                onClick={() => {
                  openDialog(disconnectAccountModalId);
                }}
              >{t`Disconnect account`}</Dropdown.ActionItem>
            )}
            <Dropdown.ActionItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={() => {
                openDialog(deleteAccountModalId);
              }}
            >{t`Delete account and synced data`}</Dropdown.ActionItem>
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
      <ConfirmationDialog
        dialogId={disconnectAccountModalId}
        title={t`Disconnect account`}
        subtitle={
          <>
            <Trans>
              Syncing will stop and credentials will be removed for the
              following. Your emails and events will be retained and available
              after you reconnect.
            </Trans>
            <SettingsAccountGroupActionTargetList targets={disconnectTargets} />
          </>
        }
        onConfirmClick={() =>
          runAccountGroupAction({
            action: 'disconnect',
            targets: disconnectTargets,
          })
        }
        confirmButtonText={t`Disconnect account`}
        shouldWaitForConfirmBeforeClosing
      />
      <ConfirmationDialog
        dialogId={deleteAccountModalId}
        title={t`Delete account and synced data?`}
        subtitle={
          <>
            <Trans>
              This permanently deletes the following and all of their synced
              emails and events. This action cannot be undone.
            </Trans>
            <SettingsAccountGroupActionTargetList targets={deleteTargets} />
          </>
        }
        onConfirmClick={() =>
          runAccountGroupAction({ action: 'delete', targets: deleteTargets })
        }
        confirmButtonText={t`Delete account and data`}
        shouldWaitForConfirmBeforeClosing
      />
    </>
  );
};
