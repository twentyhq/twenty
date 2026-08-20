import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CancelMessageCampaignOutputDTO {
  @Field(() => String)
  campaignId: string;

  // Counts the messages that existed and were stopped. Recipients the campaign had not
  // materialized yet are never written at all, so they cannot be counted here.
  @Field(() => Int)
  canceledMessageCount: number;
}
