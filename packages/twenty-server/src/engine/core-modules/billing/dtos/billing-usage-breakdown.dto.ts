/* @license Enterprise */

import { Field, Float, ObjectType } from '@nestjs/graphql';

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
}
