import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class AppTokenInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  appToken: string;
}
