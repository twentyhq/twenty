import { registerEnumType } from '@nestjs/graphql';

export enum HealthServiceStatus {
  OPERATIONAL = 'operational',
  OUTAGE = 'outage',
}

registerEnumType(HealthServiceStatus, {
  name: 'HealthServiceStatus',
});
