import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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

  // The app whose OAuth identity this client was verified against
  @Field(() => String, { nullable: true })
  oAuthIdentityUniversalIdentifier: string | null;

  // An unverified client named like a verified app, which a consent screen should flag
  @Field(() => Boolean)
  claimsVerifiedClientName: boolean;
}
