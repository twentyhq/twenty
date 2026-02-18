import { Field, Int, ObjectType } from '@nestjs/graphql';

import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

@ObjectType('MarketplaceAppField')
export class MarketplaceAppFieldDTO {
  @IsString()
  @Field()
  name: string;

  @IsString()
  @Field()
  type: string;

  @IsString()
  @Field()
  label: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  icon?: string;

  @IsString()
  @Field({ nullable: true })
  objectUniversalIdentifier: string;

  @IsString()
  @Field({ nullable: true })
  universalIdentifier: string;
}

@ObjectType('MarketplaceAppObject')
export class MarketplaceAppObjectDTO {
  @IsString()
  @Field()
  universalIdentifier: string;

  @IsString()
  @Field()
  nameSingular: string;

  @IsString()
  @Field()
  namePlural: string;

  @IsString()
  @Field()
  labelSingular: string;

  @IsString()
  @Field()
  labelPlural: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  icon?: string;

  @IsArray()
  @Field(() => [MarketplaceAppFieldDTO])
  fields: MarketplaceAppFieldDTO[];
}

@ObjectType('MarketplaceAppLogicFunction')
export class MarketplaceAppLogicFunctionDTO {
  @IsString()
  @Field()
  name: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @IsNumber()
  @Field(() => Int, { nullable: true })
  timeoutSeconds?: number;
}

@ObjectType('MarketplaceAppFrontComponent')
export class MarketplaceAppFrontComponentDTO {
  @IsString()
  @Field()
  name: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;
}

@ObjectType('MarketplaceAppRoleObjectPermission')
export class MarketplaceAppRoleObjectPermissionDTO {
  @IsString()
  @Field()
  objectUniversalIdentifier: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canReadObjectRecords?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canUpdateObjectRecords?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canSoftDeleteObjectRecords?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canDestroyObjectRecords?: boolean;
}

@ObjectType('MarketplaceAppRoleFieldPermission')
export class MarketplaceAppRoleFieldPermissionDTO {
  @IsString()
  @Field()
  objectUniversalIdentifier: string;

  @IsString()
  @Field()
  fieldUniversalIdentifier: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canReadFieldValue?: boolean;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  canUpdateFieldValue?: boolean;
}

@ObjectType('MarketplaceAppDefaultRole')
export class MarketplaceAppDefaultRoleDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  id: string;

  @IsString()
  @Field()
  label: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @Field(() => Boolean)
  canReadAllObjectRecords: boolean;

  @Field(() => Boolean)
  canUpdateAllObjectRecords: boolean;

  @Field(() => Boolean)
  canSoftDeleteAllObjectRecords: boolean;

  @Field(() => Boolean)
  canDestroyAllObjectRecords: boolean;

  @Field(() => Boolean)
  canUpdateAllSettings: boolean;

  @Field(() => Boolean)
  canAccessAllTools: boolean;

  @IsArray()
  @Field(() => [MarketplaceAppRoleObjectPermissionDTO])
  objectPermissions: MarketplaceAppRoleObjectPermissionDTO[];

  @IsArray()
  @Field(() => [MarketplaceAppRoleFieldPermissionDTO])
  fieldPermissions: MarketplaceAppRoleFieldPermissionDTO[];

  @IsArray()
  @Field(() => [String])
  permissionFlags: string[];
}

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

  @IsArray()
  @Field(() => [MarketplaceAppObjectDTO])
  objects: MarketplaceAppObjectDTO[];

  @IsArray()
  @Field(() => [MarketplaceAppFieldDTO])
  fields: MarketplaceAppFieldDTO[];

  @IsArray()
  @Field(() => [MarketplaceAppLogicFunctionDTO])
  logicFunctions: MarketplaceAppLogicFunctionDTO[];

  @IsArray()
  @Field(() => [MarketplaceAppFrontComponentDTO])
  frontComponents: MarketplaceAppFrontComponentDTO[];

  @IsOptional()
  @Field(() => MarketplaceAppDefaultRoleDTO, { nullable: true })
  defaultRole?: MarketplaceAppDefaultRoleDTO;
}
