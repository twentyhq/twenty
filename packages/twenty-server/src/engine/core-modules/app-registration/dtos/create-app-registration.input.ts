import { Field, InputType } from '@nestjs/graphql';

import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateAppRegistrationInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  author?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  universalIdentifier?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  redirectUris?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scopes?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  termsUrl?: string;
}
