import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

import { AiAgentConfigStatus } from 'src/engine/core-modules/ai-agent-config/enums/ai-agent-config-status.enum';

@InputType()
export class CreateAiAgentConfigInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  workspaceId: string;

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
  @IsNotEmpty()
  @Field()
  agent: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Field({ nullable: true })
  wipLimit?: number;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  @Field({ nullable: true })
  additionalInput?: string;

  @IsEnum(AiAgentConfigStatus)
  @IsOptional()
  @Field(() => AiAgentConfigStatus, { nullable: true })
  status?: AiAgentConfigStatus;
} 