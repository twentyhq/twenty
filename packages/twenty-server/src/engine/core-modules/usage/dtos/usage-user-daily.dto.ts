/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UsageTimeSeriesDTO } from 'src/engine/core-modules/usage/dtos/usage-time-series.dto';

@ObjectType('UsageUserDaily')
export class UsageUserDailyDTO {
  @Field(() => String)
  userWorkspaceId: string;

  @Field(() => [UsageTimeSeriesDTO])
  dailyUsage: UsageTimeSeriesDTO[];
}
