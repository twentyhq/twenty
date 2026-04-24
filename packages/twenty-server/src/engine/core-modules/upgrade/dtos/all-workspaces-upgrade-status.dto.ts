import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { InstanceUpgradeStatusDTO } from 'src/engine/core-modules/upgrade/dtos/instance-upgrade-status.dto';

@ObjectType('AllWorkspacesUpgradeStatus')
export class AllWorkspacesUpgradeStatusDTO {
  @Field(() => InstanceUpgradeStatusDTO)
  instanceUpgradeStatus: InstanceUpgradeStatusDTO;

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  upToDateCount: number;

  @Field(() => Int)
  behindCount: number;

  @Field(() => Int)
  failedCount: number;

  @Field(() => [UUIDScalarType])
  workspacesBehindIds: string[];

  @Field(() => [UUIDScalarType])
  workspacesFailedIds: string[];

  @Field(() => Date)
  computedAt: Date;
}
