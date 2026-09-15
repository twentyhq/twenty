import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

type SettingsAdminWorkspaceCreditGrantRowDropdownMenuProps = {
  creditGrantId: string;
  onRevoke: () => void;
};

export const SettingsAdminWorkspaceCreditGrantRowDropdownMenu = ({
  creditGrantId,
  onRevoke,
}: SettingsAdminWorkspaceCreditGrantRowDropdownMenuProps) => {
  const dropdownId = `settings-admin-credit-grant-row-${creditGrantId}`;

  const { closeDropdown } = useCloseDropdown();

  return (
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
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Revoke`}
              onClick={() => {
                onRevoke();
                closeDropdown(dropdownId);
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
