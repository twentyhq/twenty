import { OverridableCheckbox } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/OverridableCheckbox';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/settingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG } from '@/settings/roles/role-permissions/objects-permissions/constants/settingsRoleObjectPermissionIconConfig';
import { SettingsRolePermissionsObjectLevelPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated-metadata/graphql';
import type { Role } from '~/generated/graphql';

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledOverrideInfo = styled.span`
  background: ${({ theme }) => theme.adaptiveColors.orange1};
  border-radius: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.color.orange};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledPermissionCell = styled(TableCell)`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledCheckboxCell = styled(TableCell)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(4)};
`;

const StyledTableRow = styled(TableRow)`
  align-items: center;
  display: flex;
`;

type OverridableCheckboxType = 'no_cta' | 'default' | 'override';

type SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRowProps = {
  permission: SettingsRolePermissionsObjectLevelPermission;
  isEditable: boolean;
  settingsDraftRoleObjectPermissions: ObjectPermission;
  roleId: string;
};

export const SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRow =
  ({
    permission,
    isEditable,
    settingsDraftRoleObjectPermissions,
    roleId,
  }: SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRowProps) => {
    const theme = useTheme();

    const settingsDraftRole = useRecoilValue(
      settingsDraftRoleFamilyState(roleId),
    );

    const label = permission.label;

    const { Icon } =
      SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[permission.key];

    const permissionMappings =
      SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING;

    const settingsDraftRoleObjectPermissionValue =
      settingsDraftRoleObjectPermissions[
        permission.key as keyof ObjectPermission
      ];

    const rolePermission =
      permissionMappings[permission.key as keyof typeof permissionMappings];

    const settingsDraftRoleGlobalPermissionValue =
      settingsDraftRole[rolePermission as keyof Role];

    const isChecked = !!settingsDraftRoleObjectPermissionValue;

    const isRevoked =
      isDefined(settingsDraftRoleObjectPermissionValue) &&
      settingsDraftRoleGlobalPermissionValue === true &&
      isChecked === false;

    let checkboxType: OverridableCheckboxType;

    if (
      settingsDraftRoleGlobalPermissionValue === true &&
      settingsDraftRoleObjectPermissionValue === false
    ) {
      checkboxType = 'override';
    } else if (settingsDraftRoleGlobalPermissionValue === false) {
      checkboxType = 'no_cta';
    } else {
      checkboxType = 'default';
    }

    const handleCheckboxChange = () => {
      if (!isEditable) return;

      if (checkboxType === 'default') {
        permission.setValue(false);
      } else if (checkboxType === 'override') {
        permission.setValue(null);
      } else if (checkboxType === 'no_cta') {
        permission.setValue(!isChecked);
      }
    };

    return (
      <StyledTableRow>
        <StyledPermissionCell>
          <Icon size={theme.icon.size.sm} />
          <StyledLabel>{label}</StyledLabel>
          {isRevoked ? (
            <StyledOverrideInfo>
              {t`Revoked for this object`}
            </StyledOverrideInfo>
          ) : null}
        </StyledPermissionCell>
        <StyledCheckboxCell>
          <OverridableCheckbox
            onChange={handleCheckboxChange}
            disabled={!isEditable}
            type={checkboxType}
            checked={isChecked}
          />
        </StyledCheckboxCell>
      </StyledTableRow>
    );
  };
