import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TwoFactorAuthenticationRecoveryStatus')
export class TwoFactorAuthenticationRecoveryStatusDTO {
  @Field(() => Boolean)
  hasVerifiedTwoFactorAuthenticationMethod: boolean;

  @Field(() => Date, { nullable: true })
  pendingRecoveryCodeExpiresAt: Date | null;
}
