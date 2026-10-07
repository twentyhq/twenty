import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  SettingsPath,
} from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { useBuiltInApps } from '@/settings/app-preferences/hooks/useBuiltInApps';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  IconAt,
  IconCalendarEvent,
  IconDotsVertical,
  IconMail,
  IconPlayerPlay,
  IconRefresh,
  IconTrash,
  IconUnlink,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { Link } from 'react-router-dom';
import { DELETE_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/deleteConnectedAccount';
import { DISCONNECT_CONNECTED_ACCOUNT } from '@/settings/accounts/graphql/mutations/disconnectConnectedAccount';
import { isConnectedAccountEligibleForProviderReconnect } from '@/settings/accounts/utils/isConnectedAccountEligibleForProviderReconnect';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type SettingsAccountsRowDropdownMenuProps = {
  account: ConnectedAccount;
};

export const SettingsAccountsRowDropdownMenu = ({
  account,
}: SettingsAccountsRowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${account.id}`;
  const deleteAccountModalId = `delete-account-modal-${account.id}`;
  const disconnectAccountModalId = `disconnect-account-modal-${account.id}`;
  const accountHandle = account.handle;

  const { t } = useLingui();
  const { openDialog } = useDialog();
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { builtInApps } = useBuiltInApps();
  const messagingApp = builtInApps.find(
    (application) =>
      application.provider === account.provider && application.hasMessaging,
  );
  const calendarApp = builtInApps.find(
    (application) =>
      application.provider === account.provider && application.hasCalendar,
  );
  const accountSearchParams = new URLSearchParams({
    connectedAccountId: account.id,
  });
  const messagingSettingsPath = !isAppPreferencesEnabled
    ? getSettingsPath(SettingsPath.AccountsEmails)
    : isDefined(messagingApp)
      ? `${getSettingsPath(SettingsPath.AppPreferencesBuiltInApplication, { builtInAppId: messagingApp.id })}?${accountSearchParams}#messaging`
      : undefined;
  const calendarSettingsPath = !isAppPreferencesEnabled
    ? getSettingsPath(SettingsPath.AccountsCalendars)
    : isDefined(calendarApp)
      ? `${getSettingsPath(SettingsPath.AppPreferencesBuiltInApplication, { builtInAppId: calendarApp.id })}?${accountSearchParams}#calendar`
      : undefined;

  const apolloClient = useApolloClient();
  const [deleteConnectedAccountMutation] = useMutation(
    DELETE_CONNECTED_ACCOUNT,
  );
  const [disconnectConnectedAccountMutation] = useMutation(
    DISCONNECT_CONNECTED_ACCOUNT,
  );
  const { triggerProviderReconnect } = useTriggerProviderReconnect();

  const hasPendingConfiguration =
    account.messageChannels.some(
      (channel) =>
        channel.syncStage === MessageChannelSyncStage.PENDING_CONFIGURATION,
    ) ||
    account.calendarChannels.some(
      (channel) =>
        channel.syncStage === CalendarChannelSyncStage.PENDING_CONFIGURATION,
    );

  const isEligibleForProviderReconnect =
    isConnectedAccountEligibleForProviderReconnect(account);

  const deleteAccount = async () => {
    await deleteConnectedAccountMutation({
      variables: { id: account.id },
    });
    await apolloClient.refetchQueries({ include: 'active' });
  };

  const disconnectAccount = async () => {
    await disconnectConnectedAccountMutation({
      variables: { id: account.id },
    });
    await apolloClient.refetchQueries({ include: 'active' });
  };

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
            {hasPendingConfiguration && (
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
            {account.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV && (
              <Dropdown.ActionItem
                startIcon={<IconAt />}
                render={
                  <Link
                    to={getSettingsPath(
                      SettingsPath.EditImapSmtpCaldavConnection,
                      {
                        connectedAccountId: account.id,
                      },
                    )}
                  />
                }
              >{t`Connection settings`}</Dropdown.ActionItem>
            )}
            {isDefined(messagingSettingsPath) && (
              <Dropdown.ActionItem
                startIcon={<IconMail />}
                render={<Link to={messagingSettingsPath} />}
              >{t`Emails settings`}</Dropdown.ActionItem>
            )}
            {isDefined(calendarSettingsPath) && (
              <Dropdown.ActionItem
                startIcon={<IconCalendarEvent />}
                render={<Link to={calendarSettingsPath} />}
              >{t`Calendar settings`}</Dropdown.ActionItem>
            )}
            {isEligibleForProviderReconnect && (
              <Dropdown.ActionItem
                startIcon={<IconRefresh />}
                onClick={() => {
                  triggerProviderReconnect(account.provider, account.id, {
                    loginHint: account.handle,
                  });
                }}
              >{t`Reconnect`}</Dropdown.ActionItem>
            )}
            {!isDefined(account.archivedAt) && (
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
          <Trans>
            Syncing will stop and this account's credentials will be removed.
            Your emails and events will be retained and available after you
            reconnect.
          </Trans>
        }
        onConfirmClick={disconnectAccount}
        confirmButtonText={t`Disconnect account`}
      />
      <ConfirmationDialog
        dialogId={deleteAccountModalId}
        title={t`Delete account and synced data?`}
        subtitle={
          <Trans>
            This permanently deletes {accountHandle} and all of its synced
            emails and events. This action cannot be undone.
          </Trans>
        }
        onConfirmClick={deleteAccount}
        confirmButtonText={t`Delete account and data`}
      />
    </>
  );
};
