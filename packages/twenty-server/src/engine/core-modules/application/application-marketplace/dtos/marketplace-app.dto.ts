import { Field, ObjectType } from '@nestjs/graphql';

import { type APP_LOCALES } from 'twenty-shared/translations';

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
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  sourcePackage?: string;

  @IsBoolean()
  @Field(() => Boolean)
  isVetted: boolean;

  translatedTextsByLocale?: Partial<
    Record<
      keyof typeof APP_LOCALES,
      Pick<MarketplaceAppDTO, 'name' | 'description'>
    >
  >;
}
