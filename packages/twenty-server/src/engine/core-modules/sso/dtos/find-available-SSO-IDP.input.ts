/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class FindAvailableSSOIDPInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
