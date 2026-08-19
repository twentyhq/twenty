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

  // Two custom applications in a workspace can carry the same name, so the
  // name alone cannot tell the user which authorization they are revoking.
  @Field(() => String, { nullable: true })
  applicationUniversalIdentifier: string | null;

  // Null when the grant was reconstructed from a refresh token predating the
  // authorization record, so the screen can say the original consent is
  // unknown instead of inventing one.
  @Field(() => [String], { nullable: true })
  scopes: string[] | null;

  @Field(() => Date, { nullable: true })
  lastAuthorizedAt: Date | null;

  @Field(() => Date)
  lastUsedAt: Date;

  @Field(() => Date)
  createdAt: Date;
}
