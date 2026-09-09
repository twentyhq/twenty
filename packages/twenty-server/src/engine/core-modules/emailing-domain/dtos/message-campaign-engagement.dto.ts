import { Field, Int, ObjectType } from '@nestjs/graphql';

import { MessageCampaignEngagementBucketDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-bucket.dto';
import { MessageCampaignEngagementLinkDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-link.dto';
import { MessageCampaignEngagementRecipientDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-recipient.dto';

@ObjectType()
export class MessageCampaignEngagementDTO {
  @Field(() => Boolean)
  isAvailable: boolean;

  @Field(() => Boolean)
  isClickTrackingEnabled: boolean;

  @Field(() => Boolean)
  isOpenTrackingEnabled: boolean;

  @Field(() => Date, { nullable: true })
  calculatedAt: Date | null;

  @Field(() => Int)
  totalOpens: number;

  @Field(() => Int)
  totalClicks: number;

  @Field(() => Int)
  uniqueOpeners: number;

  @Field(() => Int)
  uniqueClickers: number;

  @Field(() => [MessageCampaignEngagementBucketDTO])
  series: MessageCampaignEngagementBucketDTO[];

  @Field(() => [MessageCampaignEngagementLinkDTO])
  links: MessageCampaignEngagementLinkDTO[];

  @Field(() => [MessageCampaignEngagementRecipientDTO])
  recipients: MessageCampaignEngagementRecipientDTO[];
}
