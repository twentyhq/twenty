import { SettingsApplicationInstallGrantRoute } from '@/settings/applications/grant/components/SettingsApplicationInstallGrantRoute';
import { SettingsRolePermissionsObjectLevelObjectForm } from '@/settings/roles/role-permissions/object-level-permissions/object-form/components/SettingsRolePermissionsObjectLevelObjectForm';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

export const SettingsApplicationInstallObject = () => {
  const { availableApplicationId, objectMetadataId } = useParams();

  if (!isDefined(availableApplicationId) || !isDefined(objectMetadataId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Applications)} />;
  }

  return (
    <SettingsApplicationInstallGrantRoute
      universalIdentifier={availableApplicationId}
    >
      {({ draftRoleId }) => (
        <SettingsRolePermissionsObjectLevelObjectForm
          roleId={draftRoleId}
          objectMetadataId={objectMetadataId}
        />
      )}
    </SettingsApplicationInstallGrantRoute>
  );
};
