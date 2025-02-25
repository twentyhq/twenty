import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MetricsDataPoint {
  @Field()
  x: string;

  @Field()
  y: number;
}
