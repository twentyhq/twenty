import { PermissionIcon } from '@/settings/roles/role-permissions/objects-permissions/components/PermissionIcon';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/settingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/settingsRoleObjectPermissionIconConfig';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated/graphql';

const StyledSettingsRolePermissionsObjectLevelOverrideCell = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type SettingsRolePermissionsObjectLevelOverrideCellProps = {
  objectPermission: ObjectPermission;
};

export const SettingsRolePermissionsObjectLevelOverrideCell = ({
  objectPermission,
}: SettingsRolePermissionsObjectLevelOverrideCellProps) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(objectPermission.roleId),
  );

  const permissionMappings =
    SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING;

  const isOverridden = (permission: SettingsRoleObjectPermissionKey) => {
    const rolePermission = permissionMappings[permission];
    return (
      isDefined(objectPermission[permission]) &&
      !!settingsDraftRole[rolePermission] !== !!objectPermission[permission]
    );
  };

  return (
    <StyledSettingsRolePermissionsObjectLevelOverrideCell>
      {(
        Object.keys(permissionMappings) as SettingsRoleObjectPermissionKey[]
      ).map((permission) => {
        const permissionValue = objectPermission[permission];

        if (!isOverridden(permission)) {
          return null;
        }

        return (
          <PermissionIcon
            key={permission}
            permission={permission}
            state={permissionValue === false ? 'revoked' : 'granted'}
          />
        );
      })}
    </StyledSettingsRolePermissionsObjectLevelOverrideCell>
  );
};
