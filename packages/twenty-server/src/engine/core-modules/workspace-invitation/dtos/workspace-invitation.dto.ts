import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('WorkspaceInvitation')
export class WorkspaceInvitation {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  email: string;

  @Field({ nullable: false })
  expiresAt: Date;
}
