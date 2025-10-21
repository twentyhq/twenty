import { Field, ObjectType } from '@nestjs/graphql';

import { QueueMetricsDataPointDTO } from 'src/engine/core-modules/admin-panel/dtos/queue-metrics-data-point.dto';

@ObjectType('QueueMetricsSeries')
export class QueueMetricsSeriesDTO {
  @Field(() => String)
  id: string;

  @Field(() => [QueueMetricsDataPointDTO])
  data: QueueMetricsDataPointDTO[];
}
