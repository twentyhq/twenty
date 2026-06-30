import { Field, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
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
  author: string;

  @IsString()
  @Field()
  category: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  logo?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  sourcePackage?: string;

  @IsBoolean()
  @Field(() => Boolean)
  isFeatured: boolean;
}
