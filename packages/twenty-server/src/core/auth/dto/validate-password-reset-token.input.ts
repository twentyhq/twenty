import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class ValidatePasswordResetToken {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  passwordResetToken: string;
}
