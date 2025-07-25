import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

@ArgsType()
export class VerifyTwoFactorAuthenticationMethodInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}
