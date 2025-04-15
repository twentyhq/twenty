import { SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG } from '@/settings/roles/role-permissions/objects-permissions/constants/settingsRoleObjectPermissionIconConfig';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated/graphql';

const StyledIconWrapper = styled.div<{ isForbidden?: boolean }>`
  align-items: center;
  background: ${({ theme, isForbidden }) =>
    isForbidden ? theme.adaptiveColors.orange1 : theme.adaptiveColors.blue1};
  border: 1px solid
    ${({ theme, isForbidden }) =>
      isForbidden ? theme.adaptiveColors.orange3 : theme.adaptiveColors.blue3};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledIcon = styled.div<{ isForbidden?: boolean }>`
  align-items: center;
  display: flex;
  color: ${({ theme, isForbidden }) =>
    isForbidden ? theme.color.orange : theme.color.blue};
  justify-content: center;
`;

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
  const theme = useTheme();

  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(objectPermission.roleId),
  );

  const permissionMappings = {
    canReadObjectRecords: 'canReadAllObjectRecords',
    canUpdateObjectRecords: 'canUpdateAllObjectRecords',
    canSoftDeleteObjectRecords: 'canSoftDeleteAllObjectRecords',
    canDestroyObjectRecords: 'canDestroyAllObjectRecords',
  } as const;

  type ObjectPermissionKey = keyof typeof permissionMappings;

  const isOverridden = (permission: ObjectPermissionKey) => {
    const rolePermission = permissionMappings[permission];
    return (
      isDefined(objectPermission[permission]) &&
      !!settingsDraftRole[rolePermission as keyof typeof settingsDraftRole] !==
        !!objectPermission[permission]
    );
  };

  return (
    <StyledSettingsRolePermissionsObjectLevelOverrideCell>
      {(Object.keys(permissionMappings) as ObjectPermissionKey[]).map(
        (permission) => {
          const { Icon, IconForbidden: IconOverride } =
            SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[permission];
          const permissionValue = objectPermission[permission];

          if (!isOverridden(permission)) {
            return null;
          }

          return (
            <StyledIconWrapper
              key={permission}
              isForbidden={permissionValue === false}
            >
              <StyledIcon isForbidden={permissionValue === false}>
                {permissionValue === false && (
                  <IconOverride size={theme.icon.size.sm} />
                )}
                {permissionValue === true && <Icon size={theme.icon.size.sm} />}
              </StyledIcon>
            </StyledIconWrapper>
          );
        },
      )}
    </StyledSettingsRolePermissionsObjectLevelOverrideCell>
  );
};
