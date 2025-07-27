import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class TwoFactorAuthenticationVerificationInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  otp: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  loginToken: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  captchaToken?: string;
}
