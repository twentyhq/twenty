import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/settingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/settingsRoleObjectPermissionIconConfig';
import styled from '@emotion/styled';
import { ObjectPermission } from '~/generated/graphql';
import { SettingsRolePermissionsObjectLevelOverrideCell } from './SettingsRolePermissionsObjectLevelOverrideCell';

const StyledSettingsRolePermissionsObjectLevelOverrideCell = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type SettingsRolePermissionsObjectLevelOverrideCellContainerProps = {
  objectPermissions: ObjectPermission;
  roleId: string;
  objectLabel: string;
};

export const SettingsRolePermissionsObjectLevelOverrideCellContainer = ({
  objectPermissions,
  roleId,
  objectLabel,
}: SettingsRolePermissionsObjectLevelOverrideCellContainerProps) => {
  const permissionMappings =
    SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING;

  return (
    <StyledSettingsRolePermissionsObjectLevelOverrideCell>
      {(
        Object.keys(permissionMappings) as SettingsRoleObjectPermissionKey[]
      ).map((permissionKey) => {
        return (
          <SettingsRolePermissionsObjectLevelOverrideCell
            key={permissionKey}
            objectPermissions={objectPermissions}
            objectPermissionKey={permissionKey}
            roleId={roleId}
            objectLabel={objectLabel}
          />
        );
      })}
    </StyledSettingsRolePermissionsObjectLevelOverrideCell>
  );
};
