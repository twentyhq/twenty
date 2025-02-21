import { registerEnumType } from '@nestjs/graphql';

export enum HealthIndicatorId {
  database = 'database',
  redis = 'redis',
  worker = 'worker',
  connectedAccount = 'connectedAccount',
}

registerEnumType(HealthIndicatorId, {
  name: 'HealthIndicatorId',
});
