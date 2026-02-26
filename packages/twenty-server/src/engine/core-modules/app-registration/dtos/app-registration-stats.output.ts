import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VersionDistributionEntry {
  @Field()
  version: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class AppRegistrationStatsOutput {
  @Field(() => Int)
  activeInstalls: number;

  @Field(() => String, { nullable: true })
  latestVersion: string | null;

  @Field(() => [VersionDistributionEntry])
  versionDistribution: VersionDistributionEntry[];
}
