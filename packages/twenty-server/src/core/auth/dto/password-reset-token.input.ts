import { ArgsType, Field } from '@nestjs/graphql';

import { IsEmail, IsNotEmpty } from 'class-validator';

@ArgsType()
export class PasswordResetTokenInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
