import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('AgentChatMessage')
export class AgentChatMessageDTO {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  threadId: string;

  @Field()
  role: 'user' | 'assistant';

  @Field()
  content: string;

  @Field()
  createdAt: Date;
}
