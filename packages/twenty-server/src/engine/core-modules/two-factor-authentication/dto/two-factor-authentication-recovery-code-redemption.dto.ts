import { Field, ObjectType } from '@nestjs/graphql';

import { AuthTokenPair } from 'src/engine/core-modules/auth/dto/auth-token-pair.dto';

@ObjectType('TwoFactorAuthenticationRecoveryCodeRedemption')
export class TwoFactorAuthenticationRecoveryCodeRedemptionDTO {
  @Field(() => AuthTokenPair, { nullable: true })
  tokens: AuthTokenPair | null;

  @Field(() => String, { nullable: true })
  provisioningUri: string | null;
}
