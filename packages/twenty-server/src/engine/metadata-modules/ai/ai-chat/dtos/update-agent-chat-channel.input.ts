import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';

@InputType()
export class UpdateAgentChatChannelInput {
  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @Field(() => AgentChatChannelVisibility, { nullable: true })
  @IsEnum(AgentChatChannelVisibility)
  @IsOptional()
  visibility?: AgentChatChannelVisibility;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string | null;
}
