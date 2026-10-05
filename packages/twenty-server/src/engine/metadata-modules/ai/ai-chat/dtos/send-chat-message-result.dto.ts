import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SendChatMessageResult')
export class SendChatMessageResultDTO {
  // null when a retried turn was opened by the agent, without a user message
  @Field(() => String, { nullable: true })
  messageId: string | null;

  @Field(() => Boolean)
  queued: boolean;

  @Field(() => String, { nullable: true })
  streamId?: string;
}
