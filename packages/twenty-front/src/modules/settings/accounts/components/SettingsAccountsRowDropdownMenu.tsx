import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { SettingsPath } from '@/types/SettingsPath';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  IconCalendarEvent,
  IconDotsVertical,
  IconMail,
  IconRefresh,
  IconTrash,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type SettingsAccountsRowDropdownMenuProps = {
  account: ConnectedAccount;
};

const DELETE_ACCOUNT_MODAL_ID = 'delete-account-modal';

export const SettingsAccountsRowDropdownMenu = ({
  account,
}: SettingsAccountsRowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${account.id}`;
  const { t } = useLingui();
  const { openModal } = useModal();

  const navigate = useNavigateSettings();
  const { closeDropdown } = useDropdown(dropdownId);

  const { destroyOneRecord } = useDestroyOneRecord({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
  });
  const { triggerProviderReconnect } = useTriggerProviderReconnect();

  const deleteAccount = async () => {
    await destroyOneRecord(account.id);
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
              <MenuItem
                LeftIcon={IconMail}
                text={t`Emails settings`}
                onClick={() => {
                  navigate(SettingsPath.AccountsEmails);
                  closeDropdown();
                }}
              />
              <MenuItem
                LeftIcon={IconCalendarEvent}
                text={t`Calendar settings`}
                onClick={() => {
                  navigate(SettingsPath.AccountsCalendars);
                  closeDropdown();
                }}
              />
              {account.authFailedAt && (
                <MenuItem
                  LeftIcon={IconRefresh}
                  text={t`Reconnect`}
                  onClick={() => {
                    triggerProviderReconnect(account.provider, account.id);
                    closeDropdown();
                  }}
                />
              )}
              <MenuItem
                accent="danger"
                LeftIcon={IconTrash}
                text={t`Remove account`}
                onClick={() => {
                  closeDropdown();
                  openModal(DELETE_ACCOUNT_MODAL_ID);
                }}
              />
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />
      <ConfirmationModal
        modalId={DELETE_ACCOUNT_MODAL_ID}
        title={t`Data deletion`}
        subtitle={
          <Trans>
            All emails and events linked to this account will be deleted
          </Trans>
        }
        onConfirmClick={deleteAccount}
        confirmButtonText={t`Delete account`}
      />
    </>
  );
};
