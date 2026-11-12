import { ArgsType, Field } from '@nestjs/graphql';

import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class GenerateTwoFactorAuthenticationBackupCodesInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  otp?: string;
}
