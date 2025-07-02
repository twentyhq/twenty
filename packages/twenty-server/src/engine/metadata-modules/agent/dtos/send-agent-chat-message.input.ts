import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class SendAgentChatMessageInput {
  @Field(() => ID)
  threadId: string;

  @Field()
  message: string;
}
