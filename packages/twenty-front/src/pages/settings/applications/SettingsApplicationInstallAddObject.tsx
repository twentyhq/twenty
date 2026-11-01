import { SettingsApplicationGrantAddObjectPage } from '@/settings/applications/grant/components/SettingsApplicationGrantAddObjectPage';
import { SettingsApplicationInstallGrantRoute } from '@/settings/applications/grant/components/SettingsApplicationInstallGrantRoute';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

export const SettingsApplicationInstallAddObject = () => {
  const { availableApplicationId } = useParams();

  if (!isDefined(availableApplicationId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Applications)} />;
  }

  return (
    <SettingsApplicationInstallGrantRoute
      universalIdentifier={availableApplicationId}
    >
      {({ draftRoleId }) => (
        <SettingsApplicationGrantAddObjectPage grantRoleId={draftRoleId} />
      )}
    </SettingsApplicationInstallGrantRoute>
  );
};
