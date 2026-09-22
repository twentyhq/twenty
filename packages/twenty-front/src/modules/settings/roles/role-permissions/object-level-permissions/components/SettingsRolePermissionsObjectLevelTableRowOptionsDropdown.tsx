import { useResetObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useResetObjectPermission';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconPencil, IconTrash } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { ListItem, UndecoratedLink } from 'twenty-ui/primitives/navigation';

type SettingsRolePermissionsObjectLevelTableRowOptionsDropdownProps = {
  roleId: string;
  objectMetadataId: string;
  objectPermissionDetailUrl: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectLevelTableRowOptionsDropdown = ({
  roleId,
  objectMetadataId,
  objectPermissionDetailUrl,
  isEditable,
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
          variant="ghost"
          size="sm"
        >
          <IconDotsVertical />
        </IconButton>
      }
      dropdownComponents={
        <DropdownContent>
          {isEditable && (
            <DropdownMenuItemsContainer>
              <UndecoratedLink
                fullWidth
                to={objectPermissionDetailUrl}
                onClick={() => closeDropdown(dropdownId)}
              >
                <ListItem startIcon={<IconPencil />}>{t`Edit`}</ListItem>
              </UndecoratedLink>
            </DropdownMenuItemsContainer>
          )}
          <DropdownMenuItemsContainer>
            <ListItem
              onClick={handleRemove}
              startIcon={<IconTrash />}
              color="danger"
            >{t`Remove rule`}</ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownPlacement="bottom-end"
    />
  );
};
