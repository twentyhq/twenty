import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplicationAuthorization')
export class ApplicationAuthorizationDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  applicationId: string;

  @Field(() => UUIDScalarType)
  workspaceId: string;

  @Field(() => String)
  applicationName: string;

  // Custom applications can share a name, so the name alone is ambiguous
  @Field(() => String, { nullable: true })
  applicationUniversalIdentifier: string | null;

  // Null for grants backfilled from refresh tokens predating the authorization record
  @Field(() => [String], { nullable: true })
  scopes: string[] | null;

  @Field(() => Date, { nullable: true })
  lastAuthorizedAt: Date | null;

  @Field(() => Date)
  lastUsedAt: Date;

  @Field(() => Date)
  createdAt: Date;
}
