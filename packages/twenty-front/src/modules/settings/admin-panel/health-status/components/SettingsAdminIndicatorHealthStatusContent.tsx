import { AccountSyncMetrics } from '@/settings/admin-panel/health-status/components/AccountSyncMetrics';
import { DatabaseAndRedisHealthStatus } from '@/settings/admin-panel/health-status/components/DatabaseAndRedisHealthStatus';
import { WorkerHealthStatus } from '@/settings/admin-panel/health-status/components/WorkerHealthStatus';
import { AdminPanelIndicatorHealthStatusInputEnum } from '~/generated/graphql';

export const SettingsAdminIndicatorHealthStatusContent = ({
  indicatorName,
}: {
  indicatorName: AdminPanelIndicatorHealthStatusInputEnum;
}) => {
  switch (indicatorName) {
    case AdminPanelIndicatorHealthStatusInputEnum.DATABASE:
      return <DatabaseAndRedisHealthStatus indicatorName={indicatorName} />;
    case AdminPanelIndicatorHealthStatusInputEnum.REDIS:
      return <DatabaseAndRedisHealthStatus indicatorName={indicatorName} />;
    case AdminPanelIndicatorHealthStatusInputEnum.WORKER:
      return <WorkerHealthStatus />;
    case AdminPanelIndicatorHealthStatusInputEnum.ACCOUNT_SYNC:
      return <AccountSyncMetrics />;
    default:
      return null;
  }
};
