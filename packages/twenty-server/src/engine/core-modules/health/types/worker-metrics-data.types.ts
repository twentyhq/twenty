import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MetricsDataPoint {
  @Field()
  x: string;

  @Field()
  y: number;
}

@ObjectType()
export class MetricsSeries {
  @Field()
  id: string;
  @Field(() => [MetricsDataPoint])
  data: MetricsDataPoint[];
}

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
