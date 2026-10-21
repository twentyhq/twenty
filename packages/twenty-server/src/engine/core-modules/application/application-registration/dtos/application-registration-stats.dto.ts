import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { CreditUsedItemDTO } from 'src/engine/core-modules/usage/dtos/credit-used-item.dto';

@ObjectType('VersionDistributionEntry')
export class VersionDistributionEntryDTO {
  @Field(() => String)
  version: string;

  @Field(() => Int)
  count: number;
}

@ObjectType('ApplicationRegistrationStats')
export class ApplicationRegistrationStatsDTO {
  @Field(() => Float, { nullable: true })
  totalCreditsUsed: number | null;

  @Field(() => [CreditUsedItemDTO], { nullable: true })
  creditsUsedBreakdown: CreditUsedItemDTO[] | null;

  @Field(() => Int)
  activeInstalls: number;

  @Field(() => Int)
  autoUpdateEnabled: number;

  @Field(() => Int)
  suspendedInstalls: number;

  @Field(() => String, { nullable: true })
  mostInstalledVersion: string | null;

  @Field(() => [VersionDistributionEntryDTO])
  versionDistribution: VersionDistributionEntryDTO[];
}
