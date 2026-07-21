import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FullNameDTO } from 'src/engine/core-modules/user/dtos/workspace-member.dto';

@ObjectType('DeletedWorkspaceMember')
export class DeletedWorkspaceMemberDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => FullNameDTO)
  name: FullNameDTO;

  @Field({ nullable: false })
  userEmail: string;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  userWorkspaceId: string | null;
}
