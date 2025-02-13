import { MessageChannelSyncJobByStatusCounter } from 'src/engine/core-modules/health/types/health-metrics.types';
import { HealthService } from 'src/engine/core-modules/health/types/health-service.types';

export type HealthSystem = {
  database: HealthService;
  redis: HealthService;
  worker: HealthService;
  messageSync: MessageChannelSyncJobByStatusCounter;
};
