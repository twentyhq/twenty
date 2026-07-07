import { Field, ObjectType } from '@nestjs/graphql';

// Public view of a catalog registration returned by the developer claim
// lookup. Never exposes the owner workspace id, only whether it is claimed.
@ObjectType('ClaimableApplicationRegistration')
export class ClaimableApplicationRegistrationDTO {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  sourcePackage: string | null;

  @Field(() => String, { nullable: true })
  logoUrl: string | null;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  author: string | null;

  @Field(() => Boolean)
  isOwned: boolean;
}
