import { Field, InputType } from '@nestjs/graphql';

import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

@InputType()
export class UpdateApplicationRegistrationInput {
  @Field()
  @IsUUID()
  id: string;

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
