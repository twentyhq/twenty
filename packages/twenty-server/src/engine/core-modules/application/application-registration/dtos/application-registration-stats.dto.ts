import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('ApplicationRegistrationCreditBreakdown')
export class ApplicationRegistrationCreditBreakdownDTO {
  @Field(() => String)
  key: string;

  @Field(() => String)
  label: string;

  @Field(() => String)
  operationType: string;

  @Field(() => Boolean)
  isAppDefined: boolean;

  @Field(() => Float)
  creditsConsumed: number;
}

@ObjectType('VersionDistributionEntry')
export class VersionDistributionEntryDTO {
  @Field(() => String)
  version: string;

  @Field(() => Int)
  count: number;
}

@ObjectType('ApplicationRegistrationStats')
export class ApplicationRegistrationStatsDTO {
  @Field(() => Int)
  activeInstalls: number;

  @Field(() => Int)
  suspendedInstalls: number;

  @Field(() => String, { nullable: true })
  mostInstalledVersion: string | null;

  @Field(() => [VersionDistributionEntryDTO])
  versionDistribution: VersionDistributionEntryDTO[];

  @Field(() => Int, { nullable: true })
  onLatestVersion: number | null;

  @Field(() => Int, { nullable: true })
  updatesAvailable: number | null;

  @Field(() => Int)
  autoUpdateEnabled: number;

  @Field(() => Int, { nullable: true })
  workspacesNeedingAttention: number | null;

  @Field(() => Int)
  healthCheckedWorkspaces: number;

  @Field(() => Float, { nullable: true })
  totalCreditsConsumed: number | null;

  @Field(() => [ApplicationRegistrationCreditBreakdownDTO], { nullable: true })
  creditBreakdown: ApplicationRegistrationCreditBreakdownDTO[] | null;
}
