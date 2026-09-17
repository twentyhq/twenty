import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';

@InputType()
export class CreateAgentChatChannelInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => AgentChatChannelVisibility, {
    nullable: true,
    defaultValue: AgentChatChannelVisibility.PUBLIC,
  })
  @IsEnum(AgentChatChannelVisibility)
  @IsOptional()
  visibility?: AgentChatChannelVisibility;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  targetObjectMetadataId?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  targetRecordId?: string | null;
}
