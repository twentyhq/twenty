/* @license Enterprise */

import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType('BillingUsageBreakdownItem')
export class BillingUsageBreakdownItemDTO {
  @Field(() => String)
  key: string;

  @Field(() => Float)
  creditsUsed: number;
}

@ObjectType('BillingUsageTimeSeries')
export class BillingUsageTimeSeriesDTO {
  @Field(() => String)
  date: string;

  @Field(() => Float)
  creditsUsed: number;
}

@InputType()
export class BillingAnalyticsInput {
  @Field(() => Date, { nullable: true })
  periodStart?: Date;

  @Field(() => Date, { nullable: true })
  periodEnd?: Date;

  @Field(() => String, { nullable: true })
  userWorkspaceId?: string;
}

@ObjectType('BillingUserDailyUsage')
export class BillingUserDailyUsageDTO {
  @Field(() => String)
  userWorkspaceId: string;

  @Field(() => [BillingUsageTimeSeriesDTO])
  dailyUsage: BillingUsageTimeSeriesDTO[];
}

@ObjectType('BillingAnalytics')
export class BillingAnalyticsDTO {
  @Field(() => [BillingUsageBreakdownItemDTO])
  usageByUser: BillingUsageBreakdownItemDTO[];

  @Field(() => [BillingUsageBreakdownItemDTO])
  usageByResource: BillingUsageBreakdownItemDTO[];

  @Field(() => [BillingUsageBreakdownItemDTO])
  usageByExecutionType: BillingUsageBreakdownItemDTO[];

  @Field(() => [BillingUsageTimeSeriesDTO])
  timeSeries: BillingUsageTimeSeriesDTO[];

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => BillingUserDailyUsageDTO, { nullable: true })
  userDailyUsage?: BillingUserDailyUsageDTO;
}
