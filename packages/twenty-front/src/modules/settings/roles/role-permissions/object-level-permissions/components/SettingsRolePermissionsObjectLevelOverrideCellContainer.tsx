import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import styled from '@emotion/styled';
import { SettingsRolePermissionsObjectLevelOverrideCell } from './SettingsRolePermissionsObjectLevelOverrideCell';

const StyledSettingsRolePermissionsObjectLevelOverrideCell = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type SettingsRolePermissionsObjectLevelOverrideCellContainerProps = {
  objectMetadataItem: ObjectMetadataItem;
  roleId: string;
  objectLabel: string;
};

export const SettingsRolePermissionsObjectLevelOverrideCellContainer = ({
  objectMetadataItem,
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
            objectMetadataItem={objectMetadataItem}
            objectPermissionKey={permissionKey}
            roleId={roleId}
            objectLabel={objectLabel}
          />
        );
      })}
    </StyledSettingsRolePermissionsObjectLevelOverrideCell>
  );
};
