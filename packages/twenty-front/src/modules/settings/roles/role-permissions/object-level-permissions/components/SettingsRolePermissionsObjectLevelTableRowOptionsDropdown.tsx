import { useResetObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useResetObjectPermission';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconPencil, IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { MenuItem, UndecoratedLink } from 'twenty-ui/navigation';

type SettingsRolePermissionsObjectLevelTableRowOptionsDropdownProps = {
  roleId: string;
  objectMetadataId: string;
  objectPermissionDetailUrl: string;
};

export const SettingsRolePermissionsObjectLevelTableRowOptionsDropdown = ({
  roleId,
  objectMetadataId,
  objectPermissionDetailUrl,
}: SettingsRolePermissionsObjectLevelTableRowOptionsDropdownProps) => {
  const dropdownId = `settings-role-object-level-options-${objectMetadataId}`;

  const { closeDropdown } = useCloseDropdown();

  const { resetObjectPermission } = useResetObjectPermission(roleId);

  const handleRemove = () => {
    closeDropdown(dropdownId);
    resetObjectPermission(objectMetadataId);
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
          <DropdownMenuItemsContainer>
            <UndecoratedLink
              fullWidth
              to={objectPermissionDetailUrl}
              onClick={() => closeDropdown(dropdownId)}
            >
              <MenuItem text={t`Edit`} LeftIcon={IconPencil} />
            </UndecoratedLink>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownPlacement="bottom-end"
    />
  );
};
