import { useUpsertObjectPermission } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermission';
import { OverridableCheckbox } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/OverridableCheckbox';
import { objectPermissionKeyToHumanReadable } from '@/settings/roles/role-permissions/object-level-permissions/utils/objectPermissionKeyToHumanReadableText';
import { PermissionIcon } from '@/settings/roles/role-permissions/objects-permissions/components/PermissionIcon';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { type SettingsRolePermissionsObjectLevelPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectPermission } from '~/generated-metadata/graphql';
import type { Role } from '~/generated/graphql';

const StyledTableRow = styled(TableRow)<{ isDisabled: boolean }>`
  align-items: center;
  display: flex;
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};
`;

const StyledPermissionCell = styled(TableCell)`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledPermissionContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPermissionLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledOverrideInfo = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledCheckboxCell = styled(TableCell)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

type OverridableCheckboxType = 'no_cta' | 'default' | 'override';

type SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRowProps = {
  objectMetadataItemId: string;
  permission: SettingsRolePermissionsObjectLevelPermission;
  isEditable: boolean;
  settingsDraftRoleObjectPermissions: ObjectPermission | undefined;
  roleId: string;
};

export const SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRow =
  ({
    objectMetadataItemId,
    permission,
    isEditable,
    settingsDraftRoleObjectPermissions,
    roleId,
  }: SettingsRolePermissionsObjectLevelObjectFormObjectLevelTableRowProps) => {
    const settingsDraftRole = useRecoilValue(
      settingsDraftRoleFamilyState(roleId),
    );

    const label = permission.label;

    const permissionMappings =
      SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING;

    const settingsDraftRoleObjectPermissionValue =
      settingsDraftRoleObjectPermissions?.[
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

    const isGranted =
      isDefined(settingsDraftRoleObjectPermissionValue) &&
      settingsDraftRoleGlobalPermissionValue === false &&
      isChecked === true;

    const isGrantedAndInherited =
      settingsDraftRoleObjectPermissionValue !== false &&
      settingsDraftRoleGlobalPermissionValue === true;

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

    const { upsertObjectPermission } = useUpsertObjectPermission({
      roleId,
    });

    const handleCheckboxChange = () => {
      if (!isEditable) return;

      if (checkboxType === 'default') {
        upsertObjectPermission(objectMetadataItemId, permission.key, false);
      } else if (checkboxType === 'override') {
        upsertObjectPermission(objectMetadataItemId, permission.key, null);
      } else if (checkboxType === 'no_cta') {
        upsertObjectPermission(
          objectMetadataItemId,
          permission.key,
          !isChecked,
        );
      }
    };

    const humanReadableAction = objectPermissionKeyToHumanReadable(
      permission.key as SettingsRoleObjectPermissionKey,
    );

    return (
      <StyledTableRow onClick={handleCheckboxChange} isDisabled={!isEditable}>
        <StyledPermissionCell>
          <StyledPermissionContent>
            <PermissionIcon
              permission={permission.key as SettingsRoleObjectPermissionKey}
              state={isRevoked ? 'revoked' : 'granted'}
            />
            <StyledPermissionLabel>{label}</StyledPermissionLabel>
          </StyledPermissionContent>
          <StyledOverrideInfo>
            {isRevoked ? (
              <>
                {' · '}
                {t`Revoked for this object`}
              </>
            ) : isGranted ? (
              <>
                {' · '}
                {t`Granted for this object`}
              </>
            ) : isGrantedAndInherited ? (
              <>
                {' · '}
                {t`This role can ${humanReadableAction} all records`}
              </>
            ) : null}
          </StyledOverrideInfo>
        </StyledPermissionCell>
        <StyledCheckboxCell onClick={(e) => e.stopPropagation()}>
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
