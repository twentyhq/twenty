import { Field, ObjectType } from '@nestjs/graphql';

// A claim challenge the current workspace has started but not yet verified,
// with enough registration context to render it without a catalog lookup.
@ObjectType('PendingApplicationRegistrationClaim')
export class PendingApplicationRegistrationClaimDTO {
  @Field(() => String)
  applicationRegistrationId: string;

  @Field(() => String)
  universalIdentifier: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  logoUrl: string | null;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String)
  sourcePackage: string;

  @Field(() => String)
  token: string;

  @Field(() => Date)
  expiresAt: Date;
}
