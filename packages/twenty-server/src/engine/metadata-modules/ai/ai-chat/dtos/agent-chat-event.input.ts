import { ArgsType, Field } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentChatConversationInput } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-conversation.input';

// an application also follows a run it starts with ai.generate, by the runId it passes
@ArgsType()
export class AgentChatEventInput extends AgentChatConversationInput {
  @Field(() => UUIDScalarType, { nullable: true })
  runId?: string | null;
}
