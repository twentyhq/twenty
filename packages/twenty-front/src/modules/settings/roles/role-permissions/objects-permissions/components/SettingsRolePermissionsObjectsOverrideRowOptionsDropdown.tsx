import { useResetObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useResetObjectPermission';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { t } from '@lingui/core/macro';
import { Link } from 'react-router-dom';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconAdjustments, IconPencil, IconTrash } from 'twenty-ui/icon';

type SettingsRolePermissionsObjectsOverrideRowOptionsDropdownProps = {
  roleId: string;
  objectMetadataId: string;
  objectPermissionDetailUrl: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectsOverrideRowOptionsDropdown = ({
  roleId,
  objectMetadataId,
  objectPermissionDetailUrl,
  isEditable,
}: SettingsRolePermissionsObjectsOverrideRowOptionsDropdownProps) => {
  const dropdownId = `settings-role-object-override-options-${objectMetadataId}`;

  const { resetObjectPermission } = useResetObjectPermission(roleId);

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      <Dropdown.Trigger
        render={
          <IconButton
            aria-label={t`Object permission options`}
            variant="ghost"
            size="sm"
          >
            <IconAdjustments />
          </IconButton>
        }
      />
      <DropdownContent align="end">
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconPencil />}
            render={<Link to={objectPermissionDetailUrl} />}
          >{t`Edit permissions`}</Dropdown.ActionItem>
          {isEditable && (
            <Dropdown.ActionItem
              startIcon={<IconTrash />}
              color="danger"
              onClick={() => resetObjectPermission(objectMetadataId)}
            >{t`Remove rule`}</Dropdown.ActionItem>
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
