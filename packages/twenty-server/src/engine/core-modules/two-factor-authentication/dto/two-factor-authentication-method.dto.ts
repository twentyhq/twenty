import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TwoFactorAuthenticatonDTO')
export class TwoFactorAuthenticationMethodSummaryDto {
  @Field({ nullable: true })
  twoFactorAuthenticationMethodId?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}
