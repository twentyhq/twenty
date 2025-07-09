import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('AgentChatThread')
export class AgentChatThreadDTO {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  agentId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
