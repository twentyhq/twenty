import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class ChangeRequiredPasswordInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
