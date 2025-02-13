import { Field, ObjectType } from '@nestjs/graphql';

import { MessageChannelSyncJobByStatusCounter } from './health-metrics.types';
import { HealthService } from './health-service.types';

@ObjectType()
export class HealthSystem {
  @Field(() => HealthService)
  database: HealthService;

  @Field(() => HealthService)
  redis: HealthService;

  @Field(() => HealthService)
  worker: HealthService;

  @Field(() => MessageChannelSyncJobByStatusCounter)
  messageSync: MessageChannelSyncJobByStatusCounter;
}
