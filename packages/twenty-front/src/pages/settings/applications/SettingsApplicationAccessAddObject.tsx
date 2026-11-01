import { SettingsApplicationGrantAddObjectPage } from '@/settings/applications/grant/components/SettingsApplicationGrantAddObjectPage';
import { SettingsApplicationGrantRoute } from '@/settings/applications/grant/components/SettingsApplicationGrantRoute';
import { Navigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

export const SettingsApplicationAccessAddObject = () => {
  const { applicationId } = useParams();

  if (!isDefined(applicationId)) {
    return <Navigate to={getSettingsPath(SettingsPath.Applications)} />;
  }

  return (
    <SettingsApplicationGrantRoute applicationId={applicationId}>
      {(grantRoleId) => (
        <SettingsApplicationGrantAddObjectPage grantRoleId={grantRoleId} />
      )}
    </SettingsApplicationGrantRoute>
  );
};
