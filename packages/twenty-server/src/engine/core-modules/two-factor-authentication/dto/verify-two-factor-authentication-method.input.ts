import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class VerifyTwoFactorAuthenticationMethodInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  otp: string;
}
