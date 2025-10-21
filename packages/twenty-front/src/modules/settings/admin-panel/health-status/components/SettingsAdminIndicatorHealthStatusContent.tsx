import { SettingsAdminConnectedAccountHealthStatus } from '@/settings/admin-panel/health-status/components/SettingsAdminConnectedAccountHealthStatus';
import { SettingsAdminJsonDataIndicatorHealthStatus } from '@/settings/admin-panel/health-status/components/SettingsAdminJsonDataIndicatorHealthStatus';
import { SettingsAdminWorkerHealthStatus } from '@/settings/admin-panel/health-status/components/SettingsAdminWorkerHealthStatus';
import { useParams } from 'react-router-dom';
import { HealthIndicatorId } from '~/generated/graphql';

export const SettingsAdminIndicatorHealthStatusContent = () => {
  const { indicatorId } = useParams();

  switch (indicatorId) {
    case HealthIndicatorId.database:
    case HealthIndicatorId.redis:
    case HealthIndicatorId.app:
      return <SettingsAdminJsonDataIndicatorHealthStatus />;
    case HealthIndicatorId.worker:
      return <SettingsAdminWorkerHealthStatus />;
    case HealthIndicatorId.connectedAccount:
      return <SettingsAdminConnectedAccountHealthStatus />;

    default:
      return null;
  }
};
