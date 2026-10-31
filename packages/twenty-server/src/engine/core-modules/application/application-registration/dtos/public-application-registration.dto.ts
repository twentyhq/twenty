import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';

@ObjectType('PublicApplicationRegistration')
export class PublicApplicationRegistrationDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  logoUrl: string | null;

  @Field(() => String, { nullable: true })
  websiteUrl: string | null;

  @Field(() => [String])
  oAuthScopes: string[];

  // Server-verified, unlike the name a dynamically registered client picks for itself
  @Field(() => WellKnownOAuthClient, { nullable: true })
  wellKnownOAuthClient: WellKnownOAuthClient | null;
}
