import { Field, ArgsType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class AuthorizeAppInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  codeChallenge?: string;

  @Field(() => String)
  @IsString()
  redirectUrl: string;
}
