import { Field, ObjectType } from '@nestjs/graphql';

import { MetricsSeries } from 'src/engine/core-modules/admin-panel/dtos/metrics-series.dto';

@ObjectType()
export class WorkerMetricsData {
  @Field()
  queueName: string;
  @Field()
  timeRange: '7D' | '1D' | '12H' | '4H';

  @Field(() => String)
  details: string;

  @Field(() => [MetricsSeries])
  data: MetricsSeries[];
}
