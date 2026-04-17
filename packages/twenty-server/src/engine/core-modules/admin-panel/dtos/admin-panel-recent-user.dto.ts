import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { UserInfoDTO } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';

@ObjectType('AdminPanelRecentUser')
export class AdminPanelRecentUserDTO extends UserInfoDTO {
  @Field(() => String, { nullable: true })
  workspaceName?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  workspaceId?: string | null;
}
