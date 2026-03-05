import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

@InputType()
export class UpdateApplicationRegistrationPayload {
  @Field({ nullable: true })
  @IsString()
  @MaxLength(256)
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(2048)
  @IsOptional()
  logoUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(256)
  @IsOptional()
  author?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  @IsOptional()
  oAuthRedirectUris?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(256, { each: true })
  @IsOptional()
  oAuthScopes?: string[];

  @Field({ nullable: true })
  @IsString()
  @MaxLength(2048)
  @IsOptional()
  websiteUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(2048)
  @IsOptional()
  termsUrl?: string;
}

@InputType()
export class UpdateApplicationRegistrationInput {
  @IsNotEmpty()
  @Field()
  @IsUUID()
  id: string;

  @Type(() => UpdateApplicationRegistrationPayload)
  @ValidateNested()
  @Field(() => UpdateApplicationRegistrationPayload)
  update: UpdateApplicationRegistrationPayload;
}
