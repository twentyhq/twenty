import { ArgsType, Field } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

import { TwoFactorAuthenticationRecoveryTargetInput } from 'src/engine/core-modules/two-factor-authentication/dto/two-factor-authentication-recovery-target.input';

@ArgsType()
export class GenerateTwoFactorAuthenticationRecoveryCodeInput extends TwoFactorAuthenticationRecoveryTargetInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  otp?: string;
}
