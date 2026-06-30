import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('VerifyTwoFactorAuthenticationMethod')
export class VerifyTwoFactorAuthenticationMethodDTO {
  @Field(() => Boolean)
  success: boolean;
}
