import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SendMessageBroadcastOutputDTO {
  @Field(() => String)
  campaignId: string;

  @Field(() => Int)
  sentCount: number;

  @Field(() => Int)
  failedCount: number;
}
