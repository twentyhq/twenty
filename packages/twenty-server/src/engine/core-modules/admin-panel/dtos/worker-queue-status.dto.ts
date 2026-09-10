import { Field, ObjectType } from '@nestjs/graphql';

import { WorkerQueueMetrics } from 'src/engine/core-modules/admin-panel/types/worker-queue-metrics.type';

@ObjectType('WorkerQueueStatus')
export class WorkerQueueStatusDTO {
  @Field(() => String)
  queueName: string;

  @Field(() => Number)
  workers: number;

  @Field(() => WorkerQueueMetrics, { nullable: true })
  metrics: WorkerQueueMetrics | null;
}
