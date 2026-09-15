import { Field, InputType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type AiModelTier } from 'twenty-shared/ai';

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsObject,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceDiscoverability } from 'src/engine/core-modules/workspace/types/workspace-discoverability.type';
import { AiModelTier as AiModelTierEnum } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-tier.enum';

@InputType()
export class UpdateWorkspaceInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  subdomain?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @Matches(
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
  )
  customDomain?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  displayName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  logo?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  inviteHash?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isPublicInviteLinkEnabled?: boolean;

  @Field(() => WorkspaceDiscoverability, { nullable: true })
  @IsEnum(WorkspaceDiscoverability)
  @IsOptional()
  workspaceDiscoverability?: WorkspaceDiscoverability;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  allowImpersonation?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isGoogleAuthEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isMicrosoftAuthEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isPasswordAuthEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isGoogleAuthBypassEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isMicrosoftAuthBypassEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isPasswordAuthBypassEnabled?: boolean;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  defaultRoleId?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isTwoFactorAuthenticationEnforced?: boolean;

  @Field({ nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  trashRetentionDays?: number;

  @Field({ nullable: true })
  @IsInt()
  @Min(30) // Minimum 30 days retention for audit compliance
  @Max(1095) // Maximum 3 years (matches ClickHouse table-level TTL)
  @IsOptional()
  eventLogRetentionDays?: number;

  @Field(() => AiModelTierEnum, { nullable: true })
  @IsEnum(AiModelTierEnum)
  @IsOptional()
  aiChatModelTier?: AiModelTier;

  @Field(() => AiModelTierEnum, { nullable: true })
  @IsEnum(AiModelTierEnum)
  @IsOptional()
  aiAgentModelTier?: AiModelTier;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isAutoModelSelectionEnabled?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  aiModelIdByTier?: Partial<Record<AiModelTier, string>>;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  aiAdditionalInstructions?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  editableProfileFields?: string[];

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isInternalMessagesImportEnabled?: boolean;
}
