import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TwoFactorAuthenticationProvision {
  @Field(() => String)
  uri: string;
}
