import { Navigate, useParams } from 'react-router-dom';

import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { SettingsRolePermissionsObjectLevelObjectForm } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectForm';
import { isDefined } from 'twenty-shared/utils';

export const SettingsRoleObjectLevel = () => {
  const { roleId, objectMetadataId } = useParams();

  if (!isDefined(roleId)) {
    return <Navigate to="/settings/roles" />;
  }

  if (!isDefined(objectMetadataId)) {
    return <Navigate to={`/settings/roles/${roleId}`} />;
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
