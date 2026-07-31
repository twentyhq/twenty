import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('UserSession')
export class UserSessionDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: true })
  workspaceId: string | null;

  @Field(() => String)
  authProvider: string;

  @Field(() => Boolean)
  isImpersonating: boolean;

  @Field(() => String, { nullable: true })
  userAgent: string | null;

  @Field(() => String, { nullable: true })
  ipAddress: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  lastActiveAt: Date;

  @Field(() => Date)
  expiresAt: Date;

  // True when this row backs the session cookie of the requesting client.
  @Field(() => Boolean)
  isCurrent: boolean;
}
