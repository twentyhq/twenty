import { ArgsType, Field } from '@nestjs/graphql';

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class SignUpInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  password: string;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  workspaceId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  workspaceInviteHash?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  workspacePersonalInviteToken?: string;

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
