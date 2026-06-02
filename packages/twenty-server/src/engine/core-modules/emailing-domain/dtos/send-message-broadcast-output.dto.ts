import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SendMessageBroadcastOutputDTO {
  @Field(() => String)
  broadcastId: string;

  @Field(() => Int)
  sentCount: number;

  @Field(() => Int)
  failedCount: number;
}
