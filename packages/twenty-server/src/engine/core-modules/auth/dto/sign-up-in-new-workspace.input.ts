import { Field, InputType } from '@nestjs/graphql';
import { isString } from '@sniptt/guards';

import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import {
  PARTNER_PATTERN,
  WORKSPACE_DISPLAY_NAME_MAX_LENGTH,
} from 'twenty-shared/constants';

@InputType()
export class SignUpInNewWorkspaceInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (isString(value) ? value.trim() : value))
  @MaxLength(WORKSPACE_DISPLAY_NAME_MAX_LENGTH)
  displayName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  subdomain?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @Matches(PARTNER_PATTERN)
  affiliatePartnerName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  captchaToken?: string;
}
