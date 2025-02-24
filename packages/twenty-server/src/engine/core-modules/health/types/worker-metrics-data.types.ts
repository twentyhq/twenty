import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MetricsDataPoint {
  @Field()
  x: string; // Timestamp in format: YYYY-MM-DD HH:MM:SS

  @Field()
  y: number; // Count value
}

@ObjectType()
export class MetricsSeries {
  @Field()
  id: string;
  @Field(() => [MetricsDataPoint])
  data: MetricsDataPoint[];
  @Field()
  color: string;
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
