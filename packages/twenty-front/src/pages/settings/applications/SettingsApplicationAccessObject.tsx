import { SettingsApplicationGrantRoute } from '@/settings/applications/grant/components/SettingsApplicationGrantRoute';
import { SettingsRolePermissionsObjectLevelObjectForm } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectForm';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

export const SettingsApplicationAccessObject = () => {
  const { applicationId, objectMetadataId } = useParams();

  if (!isDefined(applicationId) || !isDefined(objectMetadataId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Applications)} />;
  }

  return (
    <SettingsApplicationGrantRoute applicationId={applicationId}>
      {(grantRoleId) => (
        <SettingsRolePermissionsObjectLevelObjectForm
          roleId={grantRoleId}
          objectMetadataId={objectMetadataId}
        />
      )}
    </SettingsApplicationGrantRoute>
  );
};
