import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('WorkspaceInvitation')
export class WorkspaceInvitation {
  @Field(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  email: string;

  @Field(() => UUIDScalarType, { nullable: true })
  roleId?: string | null;

  @Field({ nullable: false })
  expiresAt: Date;
}
