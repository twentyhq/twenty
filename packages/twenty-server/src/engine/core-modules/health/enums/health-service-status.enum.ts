import { registerEnumType } from '@nestjs/graphql';

export enum HealthServiceStatus {
  OPERATIONAL = 'operational',
  DEGRADED = 'degraded',
  OUTAGE = 'outage',
}

registerEnumType(HealthServiceStatus, {
  name: 'HealthServiceStatus',
});
