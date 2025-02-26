import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QueueMetricsDataPoint {
  @Field()
  x: number;

  @Field()
  y: number;
}
