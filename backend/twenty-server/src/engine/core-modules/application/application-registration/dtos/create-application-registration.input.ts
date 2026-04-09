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
export class CreateApplicationRegistrationInput {
  @Field()
  @IsString()
  @MaxLength(256)
  name: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  universalIdentifier?: string;

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
}
