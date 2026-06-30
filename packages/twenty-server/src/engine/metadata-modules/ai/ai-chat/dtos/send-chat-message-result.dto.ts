import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SendChatMessageResult')
export class SendChatMessageResultDTO {
  @Field(() => String)
  messageId: string;

  @Field(() => Boolean)
  queued: boolean;

  @Field(() => String, { nullable: true })
  streamId?: string;
}
