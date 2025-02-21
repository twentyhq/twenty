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
      label: 'Database Status',
      description: 'PostgreSQL database connection status',
    },
    [HealthIndicatorId.redis]: {
      id: HealthIndicatorId.redis,
      label: 'Redis Status',
      description: 'Redis connection status',
    },
    [HealthIndicatorId.worker]: {
      id: HealthIndicatorId.worker,
      label: 'Worker Status',
      description: 'Background job worker status',
    },
    [HealthIndicatorId.connectedAccount]: {
      id: HealthIndicatorId.connectedAccount,
      label: 'Connected Account Status',
      description: 'Connected accounts status',
    },
  };
