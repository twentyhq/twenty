import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('ApplicationRegistrationAnalyticsBreakdownItem')
export class ApplicationRegistrationAnalyticsBreakdownItemDTO {
  @Field(() => String)
  key: string;

  @Field(() => Float)
  value: number;
}

@ObjectType('ApplicationRegistrationAnalyticsCounts')
export class ApplicationRegistrationAnalyticsCountsDTO {
  @Field(() => Int)
  installSucceeded: number;

  @Field(() => Int)
  installFailed: number;

  @Field(() => Int)
  upgradeSucceeded: number;

  @Field(() => Int)
  upgradeFailed: number;

  @Field(() => Int)
  uninstallSucceeded: number;

  @Field(() => Int)
  uninstallFailed: number;

  @Field(() => Int)
  functionExecutions: number;

  @Field(() => Int)
  functionErrors: number;

  @Field(() => Int)
  apiRateLimited: number;

  @Field(() => Int)
  jobRateLimited: number;

  @Field(() => Float)
  creditsCharged: number;
}

@ObjectType('ApplicationRegistrationAnalyticsTotals')
export class ApplicationRegistrationAnalyticsTotalsDTO extends ApplicationRegistrationAnalyticsCountsDTO {
  @Field(() => Int)
  activeWorkspaces: number;
}

@ObjectType('ApplicationRegistrationAnalyticsTimeSeriesPoint')
export class ApplicationRegistrationAnalyticsTimeSeriesPointDTO extends ApplicationRegistrationAnalyticsCountsDTO {
  @Field(() => String)
  date: string;
}

@ObjectType('ApplicationRegistrationAnalytics')
export class ApplicationRegistrationAnalyticsDTO {
  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => ApplicationRegistrationAnalyticsTotalsDTO)
  totals: ApplicationRegistrationAnalyticsTotalsDTO;

  @Field(() => [ApplicationRegistrationAnalyticsTimeSeriesPointDTO])
  timeSeries: ApplicationRegistrationAnalyticsTimeSeriesPointDTO[];

  @Field(() => [ApplicationRegistrationAnalyticsBreakdownItemDTO])
  functionErrorsByType: ApplicationRegistrationAnalyticsBreakdownItemDTO[];

  @Field(() => [ApplicationRegistrationAnalyticsBreakdownItemDTO])
  functionErrorsByFunction: ApplicationRegistrationAnalyticsBreakdownItemDTO[];

  @Field(() => [ApplicationRegistrationAnalyticsBreakdownItemDTO])
  functionExecutionsByFunction: ApplicationRegistrationAnalyticsBreakdownItemDTO[];

  @Field(() => [ApplicationRegistrationAnalyticsBreakdownItemDTO])
  lifecycleFailuresByErrorCode: ApplicationRegistrationAnalyticsBreakdownItemDTO[];

  @Field(() => [ApplicationRegistrationAnalyticsBreakdownItemDTO])
  creditsChargedByOperation: ApplicationRegistrationAnalyticsBreakdownItemDTO[];
}
