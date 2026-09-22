import { useResetObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useResetObjectPermission';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconPencil, IconTrash } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { Link } from 'react-router-dom';
import { Menu } from 'twenty-ui/primitives/surfaces';

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
    <DropdownMenu
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
            <Menu.Group>
              <Menu.Item
                render={
                  <Link
                    to={objectPermissionDetailUrl}
                    style={{ textDecoration: 'none' }}
                  />
                }
                onClick={() => closeDropdown(dropdownId)}
                startIcon={<IconPencil />}
              >{t`Edit`}</Menu.Item>
            </Menu.Group>
          )}
          <Menu.Group>
            <Menu.Item
              onClick={handleRemove}
              startIcon={<IconTrash />}
              color="danger"
            >{t`Remove rule`}</Menu.Item>
          </Menu.Group>
        </DropdownContent>
      }
      dropdownPlacement="bottom-end"
    />
  );
};
