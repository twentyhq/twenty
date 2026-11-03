import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class SignInToAdminConsoleInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  loginToken: string;
}
