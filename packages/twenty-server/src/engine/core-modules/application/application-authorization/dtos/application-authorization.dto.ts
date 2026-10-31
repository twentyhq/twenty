import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';

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

  // Clients pick their own registration name, so the callback host is what identifies them
  @Field(() => [String])
  redirectUriHostnames: string[];

  @Field(() => WellKnownOAuthClient, { nullable: true })
  wellKnownOAuthClient: WellKnownOAuthClient | null;

  @Field(() => Date, { nullable: true })
  lastAuthorizedAt: Date | null;

  @Field(() => Date)
  lastUsedAt: Date;

  @Field(() => Date)
  createdAt: Date;
}
