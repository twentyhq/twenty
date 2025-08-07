import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { objectPermissionKeyToHumanReadable } from '@/settings/roles/role-permissions/object-level-permissions/utils/objectPermissionKeyToHumanReadableText';
import { PermissionIcon } from '@/settings/roles/role-permissions/objects-permissions/components/PermissionIcon';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip, TooltipDelay } from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
`;

type SettingsRolePermissionsObjectLevelOverrideCellProps = {
  objectMetadataItem: ObjectMetadataItem;
  objectPermissionKey: SettingsRoleObjectPermissionKey;
  roleId: string;
  objectLabel: string;
};

export const SettingsRolePermissionsObjectLevelOverrideCell = ({
  objectMetadataItem,
  objectPermissionKey,
  roleId,
  objectLabel,
}: SettingsRolePermissionsObjectLevelOverrideCellProps) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const roleLabel = settingsDraftRole.label;

  const permissionMappings =
    SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING;

  const objectPermission = settingsDraftRole.objectPermissions?.find(
    (objectPermission) =>
      objectPermission.objectMetadataId === objectMetadataItem.id,
  );

  const permissionValue = objectPermission?.[objectPermissionKey];

  const isOverridden = (
    objectPermissionKey: SettingsRoleObjectPermissionKey,
  ) => {
    const rolePermission = permissionMappings[objectPermissionKey];

    return (
      isDefined(permissionValue) &&
      !!settingsDraftRole[rolePermission] !== !!permissionValue
    );
  };

  if (!isOverridden(objectPermissionKey)) {
    return null;
  }

  const humanReadableAction =
    objectPermissionKeyToHumanReadable(objectPermissionKey);

  const containerId = `object-level-permission-override-${roleId}-${objectPermissionKey}-${objectMetadataItem.id}`;

  return (
    <>
      <StyledContainer id={containerId}>
        <PermissionIcon
          permission={objectPermissionKey}
          state={permissionValue === false ? 'revoked' : 'granted'}
        />
      </StyledContainer>
      <AppTooltip
        anchorSelect={`#${containerId}`}
        content={
          permissionValue === false
            ? t`${roleLabel} can't ${humanReadableAction} ${objectLabel} records`
            : t`${roleLabel} can ${humanReadableAction} ${objectLabel} records`
        }
        delay={TooltipDelay.shortDelay}
        noArrow
        place="bottom"
        positionStrategy="fixed"
      />
    </>
  );
};
