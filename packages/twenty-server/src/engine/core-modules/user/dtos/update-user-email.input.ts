import { ArgsType, Field } from '@nestjs/graphql';

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class UpdateUserEmailInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  newEmail: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  verifyEmailRedirectPath?: string;
}
