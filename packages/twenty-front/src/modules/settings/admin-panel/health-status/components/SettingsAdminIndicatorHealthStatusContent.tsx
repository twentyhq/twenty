import { AccountSyncMetrics } from '@/settings/admin-panel/health-status/components/AccountSyncMetrics';
import { DatabaseAndRedisHealthStatus } from '@/settings/admin-panel/health-status/components/DatabaseAndRedisHealthStatus';
import { WorkerHealthStatus } from '@/settings/admin-panel/health-status/components/WorkerHealthStatus';
import { SettingsAdminIndicatorHealthContext } from '@/settings/admin-panel/health-status/contexts/SettingsAdminIndicatorHealthContext';
import { useContext } from 'react';
import { AdminPanelIndicatorHealthStatusInputEnum } from '~/generated/graphql';

export const SettingsAdminIndicatorHealthStatusContent = () => {
  const { indicatorHealth } = useContext(SettingsAdminIndicatorHealthContext);
  const indicatorName = indicatorHealth.indicatorName;
  switch (indicatorName) {
    case AdminPanelIndicatorHealthStatusInputEnum.DATABASE:
      return <DatabaseAndRedisHealthStatus />;
    case AdminPanelIndicatorHealthStatusInputEnum.REDIS:
      return <DatabaseAndRedisHealthStatus />;
    case AdminPanelIndicatorHealthStatusInputEnum.WORKER:
      return <WorkerHealthStatus />;
    case AdminPanelIndicatorHealthStatusInputEnum.ACCOUNT_SYNC:
      return <AccountSyncMetrics />;
    default:
      return null;
  }
};
