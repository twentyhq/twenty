import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class ChatThreadShareTargetInput {
  @Field(() => UUIDScalarType, { nullable: true })
  workspaceMemberId?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string;

  @Field(() => Boolean, { nullable: true })
  everyone?: boolean;
}

@ObjectType()
export class ChatThreadShareDTO {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  principalType: string;

  @Field(() => UUIDScalarType)
  principalId: string;
}

@ObjectType()
export class ChatThreadSharingRoleDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  label: string;
}

@ObjectType()
export class ChatThreadSharingDTO {
  @Field(() => Boolean)
  canManage: boolean;

  @Field(() => Boolean)
  isEnabled: boolean;

  @Field(() => [ChatThreadSharingRoleDTO])
  roles: ChatThreadSharingRoleDTO[];

  @Field(() => [ChatThreadShareDTO])
  shares: ChatThreadShareDTO[];
}
