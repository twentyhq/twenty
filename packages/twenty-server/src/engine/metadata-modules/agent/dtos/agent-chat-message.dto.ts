import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('AgentChatMessage')
export class AgentChatMessageDTO {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  threadId: string;

  @Field()
  role: string;

  @Field()
  content: string;

  @Field()
  createdAt: Date;
}
