import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAgentChatThreadInput {
  @Field(() => ID)
  agentId: string;
}
