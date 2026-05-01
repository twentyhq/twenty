import { ArgsType, Field } from '@nestjs/graphql';

import { IsEmail, IsNotEmpty } from 'class-validator';

import { EmailVerificationTrigger } from 'src/engine/core-modules/email-verification/email-verification.constants';

@ArgsType()
export class ResendEmailVerificationTokenInput {
  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field(() => EmailVerificationTrigger, {
    nullable: true,
    defaultValue: EmailVerificationTrigger.SIGN_UP,
  })
  verificationTrigger?: EmailVerificationTrigger;
}
