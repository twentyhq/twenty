import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  CalendarChannelSyncStage,
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  SettingsPath,
} from 'twenty-shared/types';

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
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { DELETE_CONNECTED_ACCOUNT } from '../graphql/mutations/deleteConnectedAccount';

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
                  onClick={getDropdownMenuItemClickHandler(() => {
                    navigate(SettingsPath.AccountsConfiguration, {
                      connectedAccountId: account.id,
                    });
                    closeDropdown(dropdownId);
                  })}
                >
                  <OverflowingTextWithTooltip text={t`Complete setup`} />
                </ListItem>
              )}
              {account.provider ===
                ConnectedAccountProvider.IMAP_SMTP_CALDAV && (
                <ListItem
                  startIcon={<IconAt />}
                  onClick={getDropdownMenuItemClickHandler(() => {
                    navigate(SettingsPath.EditImapSmtpCaldavConnection, {
                      connectedAccountId: account.id,
                    });
                    closeDropdown(dropdownId);
                  })}
                >
                  <OverflowingTextWithTooltip text={t`Connection settings`} />
                </ListItem>
              )}
              <ListItem
                startIcon={<IconMail />}
                onClick={getDropdownMenuItemClickHandler(() => {
                  navigate(SettingsPath.AccountsEmails);
                  closeDropdown(dropdownId);
                })}
              >
                <OverflowingTextWithTooltip text={t`Emails settings`} />
              </ListItem>
              <ListItem
                startIcon={<IconCalendarEvent />}
                onClick={getDropdownMenuItemClickHandler(() => {
                  navigate(SettingsPath.AccountsCalendars);
                  closeDropdown(dropdownId);
                })}
              >
                <OverflowingTextWithTooltip text={t`Calendar settings`} />
              </ListItem>
              {account.authFailedAt && (
                <ListItem
                  startIcon={<IconRefresh />}
                  onClick={getDropdownMenuItemClickHandler(() => {
                    triggerProviderReconnect(account.provider, account.id);
                    closeDropdown(dropdownId);
                  })}
                >
                  <OverflowingTextWithTooltip text={t`Reconnect`} />
                </ListItem>
              )}
              <ListItem
                color="danger"
                startIcon={<IconTrash />}
                onClick={getDropdownMenuItemClickHandler(() => {
                  closeDropdown(dropdownId);
                  openDialog(deleteAccountModalId);
                })}
              >
                <OverflowingTextWithTooltip text={t`Remove account`} />
              </ListItem>
            </DropdownMenuItemsContainer>
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
