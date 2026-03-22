/* @license Enterprise */

import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('UsageTimeSeries')
export class UsageTimeSeriesDTO {
  @Field(() => String)
  date: string;

  @Field(() => Float)
  creditsUsed: number;
}
