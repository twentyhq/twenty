/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UsageBreakdownItemDTO } from 'src/engine/core-modules/usage/dtos/usage-breakdown-item.dto';
import { UsageTimeSeriesDTO } from 'src/engine/core-modules/usage/dtos/usage-time-series.dto';
import { UsageUserDailyDTO } from 'src/engine/core-modules/usage/dtos/usage-user-daily.dto';

@ObjectType('UsageAnalytics')
export class UsageAnalyticsDTO {
  @Field(() => [UsageBreakdownItemDTO])
  usageByUser: UsageBreakdownItemDTO[];

  @Field(() => [UsageBreakdownItemDTO])
  usageByOperationType: UsageBreakdownItemDTO[];

  @Field(() => [UsageTimeSeriesDTO])
  timeSeries: UsageTimeSeriesDTO[];

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => UsageUserDailyDTO, { nullable: true })
  userDailyUsage?: UsageUserDailyDTO;
}
