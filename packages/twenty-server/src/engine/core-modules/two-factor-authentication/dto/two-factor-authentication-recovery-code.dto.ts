import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TwoFactorAuthenticationRecoveryCode')
export class TwoFactorAuthenticationRecoveryCodeDTO {
  @Field(() => String)
  recoveryCode: string;

  @Field(() => Date)
  expiresAt: Date;
}
