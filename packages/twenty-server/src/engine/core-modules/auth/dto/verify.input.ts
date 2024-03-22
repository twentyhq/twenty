import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class VerifyInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  loginToken: string;
}
