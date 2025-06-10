import { Field, ObjectType } from '@nestjs/graphql';

import { QueueMetricsDataPoint } from 'src/engine/core-modules/admin-panel/dtos/queue-metrics-data-point.dto';

@ObjectType()
export class QueueMetricsSeries {
  @Field()
  id: string;

  @Field(() => [QueueMetricsDataPoint])
  data: QueueMetricsDataPoint[];
}
