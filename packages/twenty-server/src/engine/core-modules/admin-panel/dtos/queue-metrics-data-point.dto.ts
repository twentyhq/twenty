import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QueueMetricsDataPoint {
  @Field(() => Number)
  x: number;

  @Field(() => Number)
  y: number;
}
