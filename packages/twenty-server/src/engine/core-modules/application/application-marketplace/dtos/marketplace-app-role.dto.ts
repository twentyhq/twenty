import { Field, ObjectType } from '@nestjs/graphql';

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ObjectType('MarketplaceAppRoleObjectPermission')
export class MarketplaceAppRoleObjectPermissionDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  objectUniversalIdentifier: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canReadObjectRecords?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canUpdateObjectRecords?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canSoftDeleteObjectRecords?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canDestroyObjectRecords?: boolean;
}

@ObjectType('MarketplaceAppRoleFieldPermission')
export class MarketplaceAppRoleFieldPermissionDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  objectUniversalIdentifier: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  fieldUniversalIdentifier: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canReadFieldValue?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canUpdateFieldValue?: boolean;
}

@ObjectType('MarketplaceAppRole')
export class MarketplaceAppRoleDTO {
  @IsString()
  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

  @IsString()
  @IsNotEmpty()
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

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canUpdateAllSettings?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canAccessAllTools?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canReadAllObjectRecords?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canUpdateAllObjectRecords?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canSoftDeleteAllObjectRecords?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  canDestroyAllObjectRecords?: boolean;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  permissionFlagUniversalIdentifiers?: string[];

  @IsOptional()
  @Field(() => [MarketplaceAppRoleObjectPermissionDTO], { nullable: true })
  objectPermissions?: MarketplaceAppRoleObjectPermissionDTO[];

  @IsOptional()
  @Field(() => [MarketplaceAppRoleFieldPermissionDTO], { nullable: true })
  fieldPermissions?: MarketplaceAppRoleFieldPermissionDTO[];
}
