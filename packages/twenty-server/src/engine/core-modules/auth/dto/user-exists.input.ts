import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class CheckUserExistsInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  email: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  captchaToken?: string;
}
