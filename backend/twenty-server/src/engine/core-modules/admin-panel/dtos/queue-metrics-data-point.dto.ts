import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('QueueMetricsDataPoint')
export class QueueMetricsDataPointDTO {
  @Field(() => Number)
  x: number;

  @Field(() => Number)
  y: number;
}
