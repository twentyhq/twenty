import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/engine/core-modules/role/role.entity';

@InputType()
export class CreatePermissionInput {
  @Field()
  @IsString()
  tableName: string;

  @Field()
  @IsBoolean()
  canCreate: boolean;

  @Field()
  @IsBoolean()
  canEdit: boolean;

  @Field()
  @IsBoolean()
  canView: boolean;

  @Field()
  @IsBoolean()
  canDelete: boolean;
}

@InputType()
export class CreateRoleInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsBoolean()
  canAccessWorkspaceSettings: boolean;

  @Field()
  @IsString()
  icon: string;

  @Field(() => ID, { nullable: true })
  @Field()
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @Field(() => ID, { nullable: true })
  @Field()
  @IsBoolean()
  @IsOptional()
  isCustom: boolean;

  @Field(() => [CreatePermissionInput])
  permissions: CreatePermissionInput[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  reportsTo?: Role;

  @Field(() => ID)
  @IsString()
  workspaceId: string;
}

@InputType()
export class UpdateRoleInput extends CreateRoleInput {}

