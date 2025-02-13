import { Field, ObjectType } from '@nestjs/graphql';

import { MessageChannelSyncJobByStatusCounter } from 'src/engine/core-modules/health/types/health-metrics.types';
import { HealthService } from 'src/engine/core-modules/health/types/health-service.types';

@ObjectType()
export class SystemHealth {
  @Field(() => HealthService)
  database: HealthService;

  @Field(() => HealthService)
  redis: HealthService;

  @Field(() => HealthService)
  worker: HealthService;

  @Field(() => MessageChannelSyncJobByStatusCounter)
  messageSync: MessageChannelSyncJobByStatusCounter;
}
