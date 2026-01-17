import { registerEnumType } from '@nestjs/graphql';

export enum HealthIndicatorId {
  database = 'database',
  redis = 'redis',
  worker = 'worker',
  connectedAccount = 'connectedAccount',
  app = 'app',
  aiLayer = 'aiLayer',
}

registerEnumType(HealthIndicatorId, {
  name: 'HealthIndicatorId',
});
