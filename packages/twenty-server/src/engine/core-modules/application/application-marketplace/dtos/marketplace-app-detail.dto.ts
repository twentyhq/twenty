import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { type Manifest } from 'twenty-shared/application';

import { MarketplaceAppRoleDTO } from 'src/engine/core-modules/application/application-marketplace/dtos/marketplace-app-role.dto';
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
  isVetted: boolean;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  author?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  category?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  logo?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  aboutDescription?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  termsUrl?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  emailSupport?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  issueReportUrl?: string;

  @Field(() => [String], {
    deprecationReason: 'Use galleryImages instead',
  })
  screenshots: string[];

  @Field(() => [String])
  galleryImages: string[];

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  defaultRoleUniversalIdentifier?: string;

  @IsOptional()
  @Field(() => [MarketplaceAppRoleDTO], { nullable: true })
  roles?: MarketplaceAppRoleDTO[];

  @Field(() => GraphQLJSON, {
    nullable: true,
    deprecationReason:
      'Use the explicit MarketplaceAppDetail fields (description, author, roles, ...) instead',
  })
  manifest?: Manifest;
}
