import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { AiAgentConfigStatus } from 'src/engine/core-modules/ai-agent-config/enums/ai-agent-config-status.enum';

@InputType()
export class AiAgentConfigFilterInput {
  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  workspaceId?: string;

  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  objectMetadataId?: string;

  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  viewId?: string;

  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  fieldMetadataId?: string;

  @IsUUID()
  @IsOptional()
  @Field({ nullable: true })
  viewGroupId?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  agent?: string;

  @IsEnum(AiAgentConfigStatus)
  @IsOptional()
  @Field(() => AiAgentConfigStatus, { nullable: true })
  status?: AiAgentConfigStatus;
} 