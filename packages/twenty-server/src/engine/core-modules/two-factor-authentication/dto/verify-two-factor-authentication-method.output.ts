import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VerifyTwoFactorAuthenticationMethodOutput {
  @Field(() => Boolean)
  success: boolean;
}
