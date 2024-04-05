import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class ExchangeAuthCodeInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  authorizationCode: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  codeVerifier?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  clientSecret?: string;
}
