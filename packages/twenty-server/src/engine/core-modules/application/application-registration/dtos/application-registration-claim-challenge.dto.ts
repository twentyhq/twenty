import { Field, ObjectType } from '@nestjs/graphql';

// Instructions returned when a workspace starts an ownership challenge: it must
// publish a version of `sourcePackage` whose package.json carries
// `twenty.claimCode` equal to `token`, then call verify before `expiresAt`.
@ObjectType('ApplicationRegistrationClaimChallenge')
export class ApplicationRegistrationClaimChallengeDTO {
  @Field(() => String)
  applicationRegistrationId: string;

  @Field(() => String)
  sourcePackage: string;

  @Field(() => String)
  token: string;

  @Field(() => Date)
  expiresAt: Date;
}
