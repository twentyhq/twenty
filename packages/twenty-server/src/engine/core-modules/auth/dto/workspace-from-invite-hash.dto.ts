import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('WorkspaceFromInviteHash')
export class WorkspaceFromInviteHashDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  logo: string | null;

  @Field(() => Boolean)
  allowImpersonation: boolean;
}
