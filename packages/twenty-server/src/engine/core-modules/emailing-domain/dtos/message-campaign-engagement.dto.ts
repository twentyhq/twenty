import { Field, Int, ObjectType } from '@nestjs/graphql';

import { MessageCampaignEngagementBucketDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-bucket.dto';
import { MessageCampaignEngagementLinkDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-link.dto';
import { MessageCampaignEngagementRecipientDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-recipient.dto';

@ObjectType()
export class MessageCampaignEngagementDTO {
  @Field(() => Boolean)
  isAvailable: boolean;

  @Field(() => Boolean)
  isCampaignClickTrackingEnabled: boolean;

  @Field(() => Boolean)
  isCampaignOpenTrackingEnabled: boolean;

  @Field(() => Int)
  totalClicks: number;

  @Field(() => Int)
  uniqueClickers: number;

  @Field(() => Int)
  totalOpens: number;

  @Field(() => Int)
  uniqueOpeners: number;

  @Field(() => [MessageCampaignEngagementBucketDTO])
  series: MessageCampaignEngagementBucketDTO[];

  @Field(() => [MessageCampaignEngagementLinkDTO])
  links: MessageCampaignEngagementLinkDTO[];

  @Field(() => [MessageCampaignEngagementRecipientDTO])
  recipients: MessageCampaignEngagementRecipientDTO[];
}
