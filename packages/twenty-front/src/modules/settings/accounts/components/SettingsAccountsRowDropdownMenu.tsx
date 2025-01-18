import {
  IconCalendarEvent,
  IconDotsVertical,
  IconMail,
  IconRefresh,
  IconTrash,
  LightIconButton,
  MenuItem,
} from 'twenty-ui';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsPath } from '@/types/SettingsPath';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type SettingsAccountsRowDropdownMenuProps = {
  account: ConnectedAccount;
};

export const SettingsAccountsRowDropdownMenu = ({
  account,
}: SettingsAccountsRowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${account.id}`;

  const navigate = useNavigateSettings();
  const { closeDropdown } = useDropdown(dropdownId);

  const { destroyOneRecord } = useDestroyOneRecord({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
  });
  const { triggerApisOAuth } = useTriggerApisOAuth();

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      dropdownHotkeyScope={{ scope: dropdownId }}
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownMenuWidth={160}
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <MenuItem
            LeftIcon={IconMail}
            text="Emails settings"
            onClick={() => {
              navigate(SettingsPath.AccountsEmails);
              closeDropdown();
            }}
          />
          <MenuItem
            LeftIcon={IconCalendarEvent}
            text="Calendar settings"
            onClick={() => {
              navigate(SettingsPath.AccountsCalendars);
              closeDropdown();
            }}
          />
          {account.authFailedAt && (
            <MenuItem
              LeftIcon={IconRefresh}
              text="Reconnect"
              onClick={() => {
                triggerApisOAuth(account.provider);
                closeDropdown();
              }}
            />
          )}
          <MenuItem
            accent="danger"
            LeftIcon={IconTrash}
            text="Remove account"
            onClick={() => {
              destroyOneRecord(account.id);
              closeDropdown();
            }}
          />
        </DropdownMenuItemsContainer>
      }
    />
  );
};
