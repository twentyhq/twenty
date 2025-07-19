import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TwoFactorAuthenticatonMethodDTO')
export class TwoFactorAuthenticationMethodSummaryDto {
  @Field({ nullable: false })
  twoFactorAuthenticationMethodId: string;

  @Field({ nullable: false })
  status: string;

  @Field({ nullable: false })
  strategy?: string;
}
