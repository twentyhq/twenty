import { Field, ObjectType } from '@nestjs/graphql';

import { UpgradeHealthEnum } from 'src/engine/core-modules/upgrade/dtos/upgrade-health.enum';
import { type UpgradeMigrationStatus } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';

@ObjectType('LatestUpgradeCommand')
export class LatestUpgradeCommandDTO {
  @Field(() => String)
  name: string;

  @Field(() => String)
  status: UpgradeMigrationStatus;

  @Field(() => String)
  executedByVersion: string;

  @Field(() => String, { nullable: true })
  errorMessage: string | null;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType('InstanceUpgradeStatus')
export class InstanceUpgradeStatusDTO {
  @Field(() => String, { nullable: true })
  inferredVersion: string | null;

  @Field(() => UpgradeHealthEnum)
  health: UpgradeHealthEnum;

  @Field(() => LatestUpgradeCommandDTO, { nullable: true })
  latestCommand: LatestUpgradeCommandDTO | null;
}
