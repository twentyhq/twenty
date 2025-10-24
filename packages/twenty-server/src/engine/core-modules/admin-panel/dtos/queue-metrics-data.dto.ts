import { Field, ObjectType } from '@nestjs/graphql';

import { QueueMetricsSeriesDTO } from 'src/engine/core-modules/admin-panel/dtos/queue-metrics-series.dto';
import { QueueMetricsTimeRange } from 'src/engine/core-modules/admin-panel/enums/queue-metrics-time-range.enum';
import { WorkerQueueMetrics } from 'src/engine/core-modules/health/types/worker-queue-metrics.type';

@ObjectType('QueueMetricsData')
export class QueueMetricsDataDTO {
  @Field(() => String)
  queueName: string;

  @Field(() => Number)
  workers: number;

  @Field(() => QueueMetricsTimeRange)
  timeRange: QueueMetricsTimeRange;

  @Field(() => WorkerQueueMetrics, { nullable: true })
  details: WorkerQueueMetrics | null;

  @Field(() => [QueueMetricsSeriesDTO])
  data: QueueMetricsSeriesDTO[];
}
