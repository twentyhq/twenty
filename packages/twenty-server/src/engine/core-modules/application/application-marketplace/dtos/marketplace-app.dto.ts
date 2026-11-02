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
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  sourcePackage?: string;

  @IsBoolean()
  @Field(() => Boolean)
  isListed: boolean;

  // Set only for an app with an OAuth identity; `{mcpServerUrl}` is left for the client to fill
  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  connectUrl?: string;
}
