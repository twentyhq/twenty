import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('ApplicationMonitoringActivityBucket')
export class ApplicationMonitoringActivityBucketDTO {
  @Field(() => Date)
  bucketStart: Date;

  @Field(() => Int)
  errorCount: number;

  @Field(() => Int)
  warningCount: number;

  @Field(() => Int)
  infoCount: number;
}

@ObjectType('ApplicationMonitoringLifecycleBucket')
export class ApplicationMonitoringLifecycleBucketDTO {
  @Field(() => Date)
  bucketStart: Date;

  @Field(() => Int)
  installCount: number;

  @Field(() => Int)
  upgradeCount: number;

  @Field(() => Int)
  uninstallCount: number;

  @Field(() => Int)
  failedCount: number;
}

@ObjectType('ApplicationMonitoringIssue')
export class ApplicationMonitoringIssueDTO {
  @Field(() => String)
  level: string;

  @Field(() => String)
  source: string;

  @Field(() => String)
  errorCode: string;

  @Field(() => String)
  logicFunctionName: string;

  @Field(() => [String])
  versions: string[];

  @Field(() => Int)
  eventCount: number;

  @Field(() => Int)
  affectedInstallCount: number;

  @Field(() => Date)
  lastSeenAt: Date;
}

@ObjectType('ApplicationMonitoringVersion')
export class ApplicationMonitoringVersionDTO {
  @Field(() => String)
  version: string;

  @Field(() => Int)
  runCount: number;

  @Field(() => Int)
  failedRunCount: number;

  @Field(() => Int)
  activeInstallCount: number;
}

@ObjectType('ApplicationMonitoringFunction')
export class ApplicationMonitoringFunctionDTO {
  @Field(() => String)
  logicFunctionName: string;

  @Field(() => Int)
  runCount: number;

  @Field(() => Int)
  failedRunCount: number;

  @Field(() => Float)
  p95DurationMs: number;
}

@ObjectType('ApplicationMonitoring')
export class ApplicationMonitoringDTO {
  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;

  @Field(() => Int)
  bucketSizeInSeconds: number;

  @Field(() => Int)
  lookbackInHours: number;

  @Field(() => Int)
  runCount: number;

  @Field(() => Int)
  failedRunCount: number;

  @Field(() => Int)
  lifecycleFailureCount: number;

  @Field(() => Int)
  rateLimitEventCount: number;

  @Field(() => [ApplicationMonitoringActivityBucketDTO])
  activity: ApplicationMonitoringActivityBucketDTO[];

  @Field(() => [ApplicationMonitoringLifecycleBucketDTO])
  lifecycle: ApplicationMonitoringLifecycleBucketDTO[];

  @Field(() => [ApplicationMonitoringIssueDTO])
  issues: ApplicationMonitoringIssueDTO[];

  @Field(() => [ApplicationMonitoringVersionDTO])
  versions: ApplicationMonitoringVersionDTO[];

  @Field(() => [ApplicationMonitoringFunctionDTO])
  functions: ApplicationMonitoringFunctionDTO[];
}
