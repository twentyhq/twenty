import { Field, InputType } from '@nestjs/graphql';

import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  EMAIL_BODY_MAX_LENGTH,
  EMAIL_MAX_RECIPIENTS_PER_FIELD,
  EMAIL_MAX_REPLY_TO,
  EMAIL_SUBJECT_MAX_LENGTH,
} from 'src/engine/core-modules/emailing-domain/constants/email-limits.constant';

@InputType()
export class SendEmailViaDomainInput {
  @Field(() => String)
  @IsString()
  emailingDomainId: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(EMAIL_MAX_RECIPIENTS_PER_FIELD)
  @IsEmail({}, { each: true })
  to: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(EMAIL_MAX_RECIPIENTS_PER_FIELD)
  @IsEmail({}, { each: true })
  cc?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(EMAIL_MAX_RECIPIENTS_PER_FIELD)
  @IsEmail({}, { each: true })
  bcc?: string[];

  @Field(() => String)
  @IsString()
  @MinLength(1)
  @MaxLength(EMAIL_SUBJECT_MAX_LENGTH)
  subject: string;

  @Field(() => String)
  @IsString()
  @MaxLength(EMAIL_BODY_MAX_LENGTH)
  text: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(EMAIL_BODY_MAX_LENGTH)
  html?: string;

  @Field(() => String)
  @IsEmail()
  from: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(EMAIL_MAX_REPLY_TO)
  @IsEmail({}, { each: true })
  replyTo?: string[];
}
