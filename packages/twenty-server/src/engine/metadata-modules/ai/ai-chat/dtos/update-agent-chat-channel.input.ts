import { Field, InputType } from '@nestjs/graphql';

import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';

@InputType('UpdateAgentChatChannelInput')
export class UpdateAgentChatChannelInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  icon?: string | null;

  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => AgentChatChannelVisibility, { nullable: true })
  visibility?: AgentChatChannelVisibility;
}
