import { HealthServiceStatus } from 'src/engine/core-modules/health/enums/heath-service-status.enum';

export type HealthService = {
  status: HealthServiceStatus;
  details?: Record<string, any>; // For any additional metrics we may want to add later
};
