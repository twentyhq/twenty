import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('AgentChatMessage')
export class AgentChatMessageDTO {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  threadId: string;

  @Field()
  sender: string;

  @Field()
  message: string;

  @Field()
  createdAt: Date;
}
