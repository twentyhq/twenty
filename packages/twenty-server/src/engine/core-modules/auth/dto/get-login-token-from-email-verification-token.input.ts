import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@ArgsType()
export class GetLoginTokenFromEmailVerificationTokenInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  emailVerificationToken: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  captchaToken?: string;
}
