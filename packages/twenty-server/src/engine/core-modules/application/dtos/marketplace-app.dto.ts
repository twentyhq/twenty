import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

@ObjectType('MarketplaceApp')
export class MarketplaceAppDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @Field()
  @MaxLength(160)
  description: string;

  @IsString()
  @Field()
  icon: string;

  @IsString()
  @Field()
  version: string;

  @IsString()
  @Field()
  author: string;

  @IsString()
  @Field()
  category: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  logo?: string;

  @IsArray()
  @Field(() => [String])
  screenshots: string[];

  @IsString()
  @Field()
  aboutDescription: string;

  @IsArray()
  @Field(() => [String])
  providers: string[];

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  termsUrl?: string;
}
