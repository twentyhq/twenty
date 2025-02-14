import { Field, ObjectType } from '@nestjs/graphql';

import { WorkerQueueMetrics } from 'src/engine/core-modules/health/types/worker-queue-metrics.type';

@ObjectType()
export class WorkerQueueHealth {
  @Field(() => String)
  name: string;

  @Field(() => Number)
  workers: number;

  @Field(() => WorkerQueueMetrics)
  metrics: WorkerQueueMetrics;
}
