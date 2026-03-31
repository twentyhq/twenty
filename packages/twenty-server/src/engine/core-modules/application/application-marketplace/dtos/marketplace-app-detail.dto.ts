import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type Manifest } from 'twenty-shared/application';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';

@ObjectType('MarketplaceAppDetail')
export class MarketplaceAppDetailDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @Field(() => ApplicationRegistrationSourceType)
  sourceType: ApplicationRegistrationSourceType;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  sourcePackage?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  latestAvailableVersion?: string;

  @IsBoolean()
  @Field(() => Boolean)
  isListed: boolean;

  @IsBoolean()
  @Field(() => Boolean)
  isFeatured: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  manifest?: Manifest;
}
