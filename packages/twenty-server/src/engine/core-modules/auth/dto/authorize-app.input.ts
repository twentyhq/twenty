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

  // RFC 6749 sets no max length on this opaque value; the /authorize URL is the practical bound
  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(8192)
  @IsOptional()
  state?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(1024)
  @IsOptional()
  scope?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(2048)
  @IsOptional()
  issuer?: string;
}
