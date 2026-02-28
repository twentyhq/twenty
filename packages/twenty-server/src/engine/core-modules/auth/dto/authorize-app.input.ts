import { Field, ArgsType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@ArgsType()
export class AuthorizeAppInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(256)
  @IsOptional()
  codeChallenge?: string;

  @Field(() => String)
  @IsString()
  @MaxLength(2048)
  redirectUrl: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(1024)
  @IsOptional()
  state?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(1024)
  @IsOptional()
  scope?: string;
}
