import { useApolloClient, useMutation } from '@apollo/client/react';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { CalendarChannelSyncStage } from '@/accounts/types/CalendarChannel';
import { MessageChannelSyncStage } from '@/accounts/types/MessageChannel';
import {
  CoreObjectNameSingular,
  ConnectedAccountProvider,
  FeatureFlagKey,
  SettingsPath,
} from 'twenty-shared/types';

import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';

import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  IconAt,
  IconCalendarEvent,
  IconDotsVertical,
  IconMail,
  IconPlayerPlay,
  IconRefresh,
  IconTrash,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
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
  const { openModal } = useModal();

  const navigate = useNavigateSettings();
  const { closeDropdown } = useCloseDropdown();

  const featureFlagsMap = useFeatureFlagsMap();
  const isMigrated =
    featureFlagsMap[FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED] ?? false;

  const apolloClient = useApolloClient();
  const { destroyOneRecord } = useDestroyOneRecord({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
  });
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
    if (isMigrated) {
      await deleteConnectedAccountMutation({
        variables: { id: account.id },
      });
      await apolloClient.refetchQueries({ include: 'active' });
    } else {
      await destroyOneRecord(account.id);
    }
  };

  return (
    <>
      <Dropdown
        dropdownId={dropdownId}
        dropdownPlacement="right-start"
        clickableComponent={
          <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
        }
        dropdownComponents={
          <DropdownContent>
            <DropdownMenuItemsContainer>
              {hasPendingConfiguration && (
                <MenuItem
                  LeftIcon={IconPlayerPlay}
                  text={t`Complete setup`}
                  onClick={() => {
                    navigate(SettingsPath.AccountsConfiguration, {
                      connectedAccountId: account.id,
                    });
                    closeDropdown(dropdownId);
                  }}
                />
              )}
              {account.provider ===
                ConnectedAccountProvider.IMAP_SMTP_CALDAV && (
                <MenuItem
                  text={t`Connection settings`}
                  LeftIcon={IconAt}
                  onClick={() => {
                    navigate(SettingsPath.EditImapSmtpCaldavConnection, {
                      connectedAccountId: account.id,
                    });
                    closeDropdown(dropdownId);
                  }}
                />
              )}
              <MenuItem
                LeftIcon={IconMail}
                text={t`Emails settings`}
                onClick={() => {
                  navigate(SettingsPath.AccountsEmails);
                  closeDropdown(dropdownId);
                }}
              />
              <MenuItem
                LeftIcon={IconCalendarEvent}
                text={t`Calendar settings`}
                onClick={() => {
                  navigate(SettingsPath.AccountsCalendars);
                  closeDropdown(dropdownId);
                }}
              />
              {account.authFailedAt && (
                <MenuItem
                  LeftIcon={IconRefresh}
                  text={t`Reconnect`}
                  onClick={() => {
                    triggerProviderReconnect(account.provider, account.id);
                    closeDropdown(dropdownId);
                  }}
                />
              )}
              <MenuItem
                accent="danger"
                LeftIcon={IconTrash}
                text={t`Remove account`}
                onClick={() => {
                  closeDropdown(dropdownId);
                  openModal(deleteAccountModalId);
                }}
              />
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />
      <ConfirmationModal
        modalInstanceId={deleteAccountModalId}
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
