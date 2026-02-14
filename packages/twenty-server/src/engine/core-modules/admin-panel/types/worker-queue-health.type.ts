import { Field, ObjectType } from '@nestjs/graphql';

import { WorkerQueueMetrics } from 'src/engine/core-modules/admin-panel/types/worker-queue-metrics.type';

@ObjectType()
export class WorkerQueueHealth {
  @Field(() => String)
  queueName: string;

  @Field(() => String)
  status: string;

  @Field(() => Number)
  workers: number;

  @Field(() => WorkerQueueMetrics)
  metrics: WorkerQueueMetrics;
}
