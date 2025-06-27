import { ArgsType, Field } from '@nestjs/graphql';

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class InitiateTwoFactorAuthenticationProvisioningInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  loginToken: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  captchaToken?: string;
}
