import { HealthServiceStatus } from 'src/engine/core-modules/health/enums/health-service-status.enum';

export type HealthService = {
  status: HealthServiceStatus;
};
