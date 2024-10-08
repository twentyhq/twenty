import { useNavigate } from 'react-router-dom';
import {
  IconCalendarEvent,
  IconDotsVertical,
  IconMail,
  IconRefresh,
  IconTrash,
} from 'twenty-ui';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useTriggerGoogleApisOAuth } from '@/settings/accounts/hooks/useTriggerGoogleApisOAuth';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type SettingsAccountsRowDropdownMenuProps = {
  account: ConnectedAccount;
  className?: string;
};

export const SettingsAccountsRowDropdownMenu = ({
  account,
  className,
}: SettingsAccountsRowDropdownMenuProps) => {
  const dropdownId = `settings-account-row-${account.id}`;

  const navigate = useNavigate();
  const { closeDropdown } = useDropdown(dropdownId);

  const { destroyOneRecord } = useDestroyOneRecord({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
  });

  const { triggerGoogleApisOAuth } = useTriggerGoogleApisOAuth();

  return (
    <Dropdown
      dropdownId={dropdownId}
      className={className}
      dropdownPlacement="right-start"
      dropdownHotkeyScope={{ scope: dropdownId }}
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownMenu>
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconMail}
              text="Emails settings"
              onClick={() => {
                navigate(`/settings/accounts/emails`);
                closeDropdown();
              }}
            />
            <MenuItem
              LeftIcon={IconCalendarEvent}
              text="Calendar settings"
              onClick={() => {
                navigate(`/settings/accounts/calendars`);
                closeDropdown();
              }}
            />
            {account.authFailedAt && (
              <MenuItem
                LeftIcon={IconRefresh}
                text="Reconnect"
                onClick={() => {
                  triggerGoogleApisOAuth();
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
        </DropdownMenu>
      }
    />
  );
};
