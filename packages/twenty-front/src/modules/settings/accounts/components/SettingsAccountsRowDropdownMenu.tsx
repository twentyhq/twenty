import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  SettingsPath,
} from 'twenty-shared/types';

import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
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
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { DELETE_CONNECTED_ACCOUNT } from '../graphql/mutations/deleteConnectedAccount';
import { Menu } from 'twenty-ui/primitives/surfaces';

type SettingsAccountsRowDropdownMenuProps = {
  account: ConnectedAccount;
};

export const SettingsAccountsRowDropdownMenu = ({
  account,
}: SettingsAccountsRowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${account.id}`;
  const deleteAccountModalId = `delete-account-modal-${account.id}`;
  const accountHandle = account.handle;

  const { t } = useLingui();
  const { openDialog } = useDialog();

  const navigate = useNavigateSettings();
  const { closeDropdown } = useCloseDropdown();

  const apolloClient = useApolloClient();
  const [deleteConnectedAccountMutation] = useMutation(
    DELETE_CONNECTED_ACCOUNT,
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

  const deleteAccount = async () => {
    await deleteConnectedAccountMutation({
      variables: { id: account.id },
    });
    await apolloClient.refetchQueries({ include: 'active' });
  };

  return (
    <>
      <DropdownMenu
        dropdownId={dropdownId}
        dropdownPlacement="right-start"
        clickableComponent={
          <LightIconButton emphasis="subtle" aria-label={t`More options`}>
            <IconDotsVertical />
          </LightIconButton>
        }
        dropdownComponents={
          <DropdownContent>
            <Menu.Group>
              {hasPendingConfiguration && (
                <Menu.Item
                  startIcon={<IconPlayerPlay />}
                  onClick={() => {
                    navigate(SettingsPath.AccountsConfiguration, {
                      connectedAccountId: account.id,
                    });
                    closeDropdown(dropdownId);
                  }}
                >{t`Complete setup`}</Menu.Item>
              )}
              {account.provider ===
                ConnectedAccountProvider.IMAP_SMTP_CALDAV && (
                <Menu.Item
                  startIcon={<IconAt />}
                  onClick={() => {
                    navigate(SettingsPath.EditImapSmtpCaldavConnection, {
                      connectedAccountId: account.id,
                    });
                    closeDropdown(dropdownId);
                  }}
                >{t`Connection settings`}</Menu.Item>
              )}
              <Menu.Item
                startIcon={<IconMail />}
                onClick={() => {
                  navigate(SettingsPath.AccountsEmails);
                  closeDropdown(dropdownId);
                }}
              >{t`Emails settings`}</Menu.Item>
              <Menu.Item
                startIcon={<IconCalendarEvent />}
                onClick={() => {
                  navigate(SettingsPath.AccountsCalendars);
                  closeDropdown(dropdownId);
                }}
              >{t`Calendar settings`}</Menu.Item>
              {account.authFailedAt && (
                <Menu.Item
                  startIcon={<IconRefresh />}
                  onClick={() => {
                    triggerProviderReconnect(account.provider, account.id);
                    closeDropdown(dropdownId);
                  }}
                >{t`Reconnect`}</Menu.Item>
              )}
              <Menu.Item
                color="danger"
                startIcon={<IconTrash />}
                onClick={() => {
                  closeDropdown(dropdownId);
                  openDialog(deleteAccountModalId);
                }}
              >{t`Remove account`}</Menu.Item>
            </Menu.Group>
          </DropdownContent>
        }
      />
      <ConfirmationDialog
        dialogId={deleteAccountModalId}
        title={t`Data deletion`}
        subtitle={
          <Trans>
            All emails and events linked to this account ({accountHandle}) will
            be deleted
          </Trans>
        }
        onConfirmClick={deleteAccount}
        confirmButtonText={t`Delete account`}
      />
    </>
  );
};
