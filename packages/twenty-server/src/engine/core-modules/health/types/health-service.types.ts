import { Field, ObjectType } from '@nestjs/graphql';

import { HealthServiceStatus } from 'src/engine/core-modules/health/enums/health-service-status.enum';
import { WorkerQueueHealth } from 'src/engine/core-modules/health/types/worker-queue-health,type';

@ObjectType()
export class HealthService {
  @Field(() => HealthServiceStatus)
  status: HealthServiceStatus;

  @Field(() => String, { nullable: true })
  details?: string;

  @Field(() => [WorkerQueueHealth], { nullable: true })
  queues?: WorkerQueueHealth[];
}
