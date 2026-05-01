import { ArgsType, Field } from '@nestjs/graphql';

import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

import { EmailVerificationTrigger } from 'src/engine/core-modules/email-verification/email-verification.constants';

@ArgsType()
export class ResendEmailVerificationTokenInput {
  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field(() => EmailVerificationTrigger, { nullable: true })
  @IsOptional()
  @IsEnum(EmailVerificationTrigger)
  verificationTrigger?: EmailVerificationTrigger;
}
