import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FullName } from 'src/engine/core-modules/user/dtos/workspace-member.dto';

@ObjectType()
export class DeletedWorkspaceMember {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => FullName)
  name: FullName;

  @Field({ nullable: false })
  userEmail: string;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  userWorkspaceId: string | null;
}
