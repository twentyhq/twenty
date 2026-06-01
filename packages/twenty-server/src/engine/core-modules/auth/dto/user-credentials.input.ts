import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { type APP_LOCALES } from 'twenty-shared/translations';

@ArgsType()
export class UserCredentialsInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  email: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  password: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  captchaToken?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  locale?: keyof typeof APP_LOCALES;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  verifyEmailRedirectPath?: string;
}
