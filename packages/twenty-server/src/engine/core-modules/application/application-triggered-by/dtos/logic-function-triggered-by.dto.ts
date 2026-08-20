import { Field, ObjectType } from '@nestjs/graphql';

import { type LogicFunctionTriggeredBy } from 'twenty-shared/application';
import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('LogicFunctionTriggeredBy')
export class LogicFunctionTriggeredByDto implements LogicFunctionTriggeredBy {
  @Field(() => UUIDScalarType)
  userId: string;

  @Field(() => UUIDScalarType)
  userWorkspaceId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  workspaceMemberId: string | null;

  @Field(() => [PermissionFlagType])
  permissionFlags: PermissionFlagType[];
}
