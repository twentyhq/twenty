import { Field, InputType } from '@nestjs/graphql';
import { isString, isUndefined } from '@sniptt/guards';
import { Transform } from 'class-transformer';

import GraphQLJSON from 'graphql-type-json';
import {
  AI_CHAT_ASSISTANT_AVATAR_COLORS,
  AI_CHAT_ASSISTANT_AVATAR_FACES,
  AI_CHAT_ASSISTANT_AVATAR_SHAPES,
  AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH,
  type AiChatAssistantAvatarColor,
  type AiChatAssistantAvatarFace,
  type AiChatAssistantAvatarShape,
  type AiModelTier,
} from 'twenty-shared/ai';
import { EVENT_LOG_RETENTION } from 'twenty-shared/constants';

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsObject,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
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

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isCampaignClickTrackingEnabled?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isCampaignOpenTrackingEnabled?: boolean;

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
  @Min(EVENT_LOG_RETENTION.minInDays)
  @Max(EVENT_LOG_RETENTION.maxInDays)
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
  aiEvaluationModelId?: string;

  @Field(() => AiChatAssistantMode, { nullable: true })
  @IsEnum(AiChatAssistantMode)
  @ValidateIf(
    ({ aiChatDirectMessageAssistantMode }: UpdateWorkspaceInput) =>
      !isUndefined(aiChatDirectMessageAssistantMode),
  )
  aiChatDirectMessageAssistantMode?: AiChatAssistantMode;

  @Field(() => AiChatAssistantMode, { nullable: true })
  @IsEnum(AiChatAssistantMode)
  @ValidateIf(
    ({ aiChatInboxAssistantMode }: UpdateWorkspaceInput) =>
      !isUndefined(aiChatInboxAssistantMode),
  )
  aiChatInboxAssistantMode?: AiChatAssistantMode;

  @Field(() => String, { nullable: true })
  @Transform(({ value }: { value: unknown }) =>
    isString(value) ? value.trim() : value,
  )
  @IsString()
  @Length(1, AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH)
  @ValidateIf(
    ({ aiChatAssistantDisplayName }: UpdateWorkspaceInput) =>
      !isUndefined(aiChatAssistantDisplayName),
  )
  aiChatAssistantDisplayName?: string;

  @Field(() => String, { nullable: true })
  @IsIn(AI_CHAT_ASSISTANT_AVATAR_SHAPES)
  @ValidateIf(
    ({ aiChatAssistantAvatarShape }: UpdateWorkspaceInput) =>
      !isUndefined(aiChatAssistantAvatarShape),
  )
  aiChatAssistantAvatarShape?: AiChatAssistantAvatarShape;

  @Field(() => String, { nullable: true })
  @IsIn(AI_CHAT_ASSISTANT_AVATAR_COLORS)
  @ValidateIf(
    ({ aiChatAssistantAvatarColor }: UpdateWorkspaceInput) =>
      !isUndefined(aiChatAssistantAvatarColor),
  )
  aiChatAssistantAvatarColor?: AiChatAssistantAvatarColor;

  @Field(() => String, { nullable: true })
  @IsIn(AI_CHAT_ASSISTANT_AVATAR_FACES)
  @ValidateIf(
    ({ aiChatAssistantAvatarFace }: UpdateWorkspaceInput) =>
      !isUndefined(aiChatAssistantAvatarFace),
  )
  aiChatAssistantAvatarFace?: AiChatAssistantAvatarFace;

  @Field({ nullable: true })
  @IsBoolean()
  @ValidateIf(
    ({ isAiChatAssistantAvatarAnimated }: UpdateWorkspaceInput) =>
      !isUndefined(isAiChatAssistantAvatarAnimated),
  )
  isAiChatAssistantAvatarAnimated?: boolean;

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
