// Options dropdown for object-level permission rows (remove, etc.), similar structure to AdvancedFilterRecordFilterOptionsDropdown

import { useRemoveObjectPermissionFromDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useRemoveObjectPermissionFromDraftRole';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type SettingsRolePermissionsObjectLevelTableRowOptionsDropdownProps = {
  roleId: string;
  objectMetadataId: string;
};

export const SettingsRolePermissionsObjectLevelTableRowOptionsDropdown = ({
  roleId,
  objectMetadataId,
}: SettingsRolePermissionsObjectLevelTableRowOptionsDropdownProps) => {
  const dropdownId = `settings-role-object-level-options-${objectMetadataId}`;

  const { closeDropdown } = useCloseDropdown();

  const { removeObjectPermissionFromDraftRole } =
    useRemoveObjectPermissionFromDraftRole(roleId);

  const handleRemove = () => {
    closeDropdown(dropdownId);
    removeObjectPermissionFromDraftRole(objectMetadataId);
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <IconButton
          aria-label={t`Object permission options`}
          variant="tertiary"
          Icon={IconDotsVertical}
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <MenuItem
              text={t`Remove rule`}
              onClick={handleRemove}
              LeftIcon={IconTrash}
              accent="danger"
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownPlacement="bottom-end"
    />
  );
};
