import { Field, Int, ObjectType } from '@nestjs/graphql';

import { VersionDistributionEntry } from 'src/engine/core-modules/application-registration/dtos/version-distribution-entry.dto';

@ObjectType('ApplicationRegistrationStats')
export class ApplicationRegistrationStatsDTO {
  @Field(() => Int)
  activeInstalls: number;

  @Field(() => String, { nullable: true })
  mostInstalledVersion: string | null;

  @Field(() => [VersionDistributionEntry])
  versionDistribution: VersionDistributionEntry[];
}
