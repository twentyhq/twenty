import { Field, ID, ObjectType } from '@nestjs/graphql';

import { AgentChatMessageRole } from 'src/engine/metadata-modules/agent/agent-chat-message.entity';

@ObjectType('AgentChatMessage')
export class AgentChatMessageDTO {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  threadId: string;

  @Field()
  role: AgentChatMessageRole;

  @Field()
  content: string;

  @Field()
  createdAt: Date;
}
