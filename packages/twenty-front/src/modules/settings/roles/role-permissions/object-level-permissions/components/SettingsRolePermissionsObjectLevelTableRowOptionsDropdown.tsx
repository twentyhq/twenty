// Options dropdown for object-level permission rows (remove, etc.), similar structure to AdvancedFilterRecordFilterOptionsDropdown

import { useUpsertFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useUpsertFieldPermissionInDraftRole';
import { useRemoveObjectPermissionFromDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useRemoveObjectPermissionFromDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { type FieldPermission } from '~/generated/graphql';

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

  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const fieldPermissionsForObject =
    settingsDraftRole.fieldPermissions?.filter(
      (permission) => permission.objectMetadataId === objectMetadataId,
    ) ?? [];

  const { removeObjectPermissionFromDraftRole } =
    useRemoveObjectPermissionFromDraftRole(roleId);

  const { upsertFieldPermissionInDraftRole } =
    useUpsertFieldPermissionInDraftRole(roleId);

  const handleRemove = () => {
    closeDropdown(dropdownId);
    removeObjectPermissionFromDraftRole(objectMetadataId);

    //! removal of field permission logic
    fieldPermissionsForObject.forEach((fieldPermission: FieldPermission) => {
      upsertFieldPermissionInDraftRole({
        ...fieldPermission,
        canUpdateFieldValue: null,
        canReadFieldValue: null,
      });
    });
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
