import { ConnectedAccountHealthStatus } from '@/settings/admin-panel/health-status/components/ConnectedAccountHealthStatus';
import { DatabaseAndRedisHealthStatus } from '@/settings/admin-panel/health-status/components/DatabaseAndRedisHealthStatus';
import { WorkerHealthStatus } from '@/settings/admin-panel/health-status/components/WorkerHealthStatus';
import { useParams } from 'react-router-dom';
import { HealthIndicatorId } from '~/generated/graphql';

export const SettingsAdminIndicatorHealthStatusContent = () => {
  const { indicatorId } = useParams();

  switch (indicatorId) {
    case HealthIndicatorId.database:
    case HealthIndicatorId.redis:
      return <DatabaseAndRedisHealthStatus />;
    case HealthIndicatorId.worker:
      return <WorkerHealthStatus />;
    case HealthIndicatorId.connectedAccount:
      return <ConnectedAccountHealthStatus />;
    default:
      return null;
  }
};
