import { Field, InputType } from '@nestjs/graphql';

import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

@InputType()
export class SendEmailViaDomainInput {
  @Field(() => String)
  @IsString()
  emailingDomainId: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  to: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @Field(() => String)
  @IsString()
  @MinLength(1)
  subject: string;

  @Field(() => String)
  @IsString()
  text: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  html?: string;

  @Field(() => String)
  @IsEmail()
  from: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  replyTo?: string[];
}
