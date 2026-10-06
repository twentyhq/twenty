import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';

@InputType('CreateAgentChatChannelInput')
export class CreateAgentChatChannelInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  icon?: string | null;

  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => AgentChatChannelVisibility, {
    defaultValue: AgentChatChannelVisibility.PUBLIC,
  })
  visibility: AgentChatChannelVisibility;

  // The creator always joins
  @Field(() => [UUIDScalarType], { defaultValue: [] })
  memberIds: string[];
}
