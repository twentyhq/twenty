import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CampaignSkippedRecipientsDTO {
  @Field(() => Int)
  noEmail: number;

  @Field(() => Int)
  deduped: number;

  @Field(() => Int)
  overCap: number;
}

@ObjectType()
export class SendMessageCampaignOutputDTO {
  @Field(() => String)
  campaignId: string;

  // Recipients materialized as QUEUED messages and enqueued for async sending.
  @Field(() => Int)
  queuedCount: number;

  @Field(() => CampaignSkippedRecipientsDTO)
  skipped: CampaignSkippedRecipientsDTO;
}
