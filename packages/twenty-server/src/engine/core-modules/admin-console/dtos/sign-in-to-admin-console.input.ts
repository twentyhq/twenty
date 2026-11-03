import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@ArgsType()
export class SignInToAdminConsoleInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MaxLength(4096)
  loginToken: string;
}
