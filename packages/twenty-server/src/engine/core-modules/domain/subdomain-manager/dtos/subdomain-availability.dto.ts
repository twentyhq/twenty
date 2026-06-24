import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SubdomainAvailabilityDTO {
  @Field(() => Boolean)
  isValid: boolean;

  @Field(() => Boolean)
  available: boolean;

  @Field(() => String)
  suggestedSubdomain: string;

  @Field(() => [String])
  suggestedSubdomains: string[];
}
