import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { LatestUpgradeCommandDTO } from 'src/engine/core-modules/upgrade/dtos/instance-upgrade-status.dto';
import { UpgradeHealthEnum } from 'src/engine/core-modules/upgrade/dtos/upgrade-health.enum';

@ObjectType('WorkspaceUpgradeStatus')
export class WorkspaceUpgradeStatusDTO {
  @Field(() => UUIDScalarType)
  workspaceId: string;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  inferredVersion: string | null;

  @Field(() => UpgradeHealthEnum)
  health: UpgradeHealthEnum;

  @Field(() => LatestUpgradeCommandDTO, { nullable: true })
  latestCommand: LatestUpgradeCommandDTO | null;
}
