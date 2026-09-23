import { ListItem } from 'twenty-ui/primitives/navigation';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  SettingsPath,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
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
import { LightIconButton } from 'twenty-ui/components';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { DELETE_CONNECTED_ACCOUNT } from '../graphql/mutations/deleteConnectedAccount';
import { DISCONNECT_CONNECTED_ACCOUNT } from '../graphql/mutations/disconnectConnectedAccount';
import { isConnectedAccountEligibleForProviderReconnect } from '../constants/isConnectedAccountEligibleForProviderReconnect.const';

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

  const navigate = useNavigateSettings();
  const { closeDropdown } = useCloseDropdown();

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
      <Dropdown
        dropdownId={dropdownId}
        dropdownPlacement="right-start"
        clickableComponent={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
        dropdownComponents={
          <DropdownContent>
            <DropdownMenuItemsContainer>
              {hasPendingConfiguration && (
                <ListItem
                  startIcon={<IconPlayerPlay />}
                  onClick={() => {
                    navigate(SettingsPath.AccountsConfiguration, {
                      connectedAccountId: account.id,
                    });
                    closeDropdown(dropdownId);
                  }}
                >{t`Complete setup`}</ListItem>
              )}
              {account.provider ===
                ConnectedAccountProvider.IMAP_SMTP_CALDAV && (
                <ListItem
                  startIcon={<IconAt />}
                  onClick={() => {
                    navigate(SettingsPath.EditImapSmtpCaldavConnection, {
                      connectedAccountId: account.id,
                    });
                    closeDropdown(dropdownId);
                  }}
                >{t`Connection settings`}</ListItem>
              )}
              <ListItem
                startIcon={<IconMail />}
                onClick={() => {
                  navigate(SettingsPath.AccountsEmails);
                  closeDropdown(dropdownId);
                }}
              >{t`Emails settings`}</ListItem>
              <ListItem
                startIcon={<IconCalendarEvent />}
                onClick={() => {
                  navigate(SettingsPath.AccountsCalendars);
                  closeDropdown(dropdownId);
                }}
              >{t`Calendar settings`}</ListItem>
              {isEligibleForProviderReconnect && (
                <ListItem
                  startIcon={<IconRefresh />}
                  onClick={() => {
                    triggerProviderReconnect(account.provider, account.id, {
                      loginHint: account.handle,
                    });
                    closeDropdown(dropdownId);
                  }}
                >{t`Reconnect`}</ListItem>
              )}
              {!isDefined(account.archivedAt) && (
                <ListItem
                  startIcon={<IconUnlink />}
                  onClick={() => {
                    closeDropdown(dropdownId);
                    openDialog(disconnectAccountModalId);
                  }}
                >{t`Disconnect account`}</ListItem>
              )}
              <ListItem
                color="danger"
                startIcon={<IconTrash />}
                onClick={() => {
                  closeDropdown(dropdownId);
                  openDialog(deleteAccountModalId);
                }}
              >{t`Delete account and synced data`}</ListItem>
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />
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
