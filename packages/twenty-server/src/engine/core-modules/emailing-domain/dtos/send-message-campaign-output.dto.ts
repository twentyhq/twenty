import { Field, Int, ObjectType } from '@nestjs/graphql';

import { CampaignSkippedRecipientsDTO } from 'src/engine/core-modules/emailing-domain/dtos/campaign-skipped-recipients.dto';

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
