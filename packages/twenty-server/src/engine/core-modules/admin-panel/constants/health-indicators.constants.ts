import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';

type HealthIndicatorInfo = {
  id: HealthIndicatorId;
  label: string;
  description: string;
};

export const HEALTH_INDICATORS: Record<HealthIndicatorId, HealthIndicatorInfo> =
  {
    [HealthIndicatorId.database]: {
      id: HealthIndicatorId.database,
      label: 'Database',
      description: 'PostgreSQL database connection status',
    },
    [HealthIndicatorId.redis]: {
      id: HealthIndicatorId.redis,
      label: 'Redis',
      description: 'Redis connection status',
    },
    [HealthIndicatorId.worker]: {
      id: HealthIndicatorId.worker,
      label: 'Worker',
      description: 'Background job worker health status',
    },
    [HealthIndicatorId.connectedAccount]: {
      id: HealthIndicatorId.connectedAccount,
      label: 'Connected Accounts',
      description: 'Connected accounts health status',
    },
    [HealthIndicatorId.app]: {
      id: HealthIndicatorId.app,
      label: 'App',
      description: 'Workspace metadata migration status check',
    },
  };
