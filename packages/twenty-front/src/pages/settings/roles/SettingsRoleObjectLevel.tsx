import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRolePermissionsObjectLevelObjectForm } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectForm';
import { SettingsPath } from '@/types/SettingsPath';
import { Navigate, useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsRoleObjectLevel = () => {
  const { roleId, objectMetadataId } = useParams();

  if (!isDefined(roleId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Roles)} />;
  }

  if (!isDefined(objectMetadataId)) {
    return (
      <Navigate to={getSettingsPath(SettingsPath.RoleDetail, { roleId })} />
    );
  }

  return (
    <>
      <SettingsRolesQueryEffect />
      <SettingsRolePermissionsObjectLevelObjectForm
        roleId={roleId}
        objectMetadataId={objectMetadataId}
      />
    </>
  );
};
