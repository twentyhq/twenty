import { Field, ObjectType } from '@nestjs/graphql';

import { MetricsDataPoint } from 'src/engine/core-modules/admin-panel/dtos/metrics-data-point.dto';

@ObjectType()
export class MetricsSeries {
  @Field()
  id: string;
  @Field(() => [MetricsDataPoint])
  data: MetricsDataPoint[];
}
