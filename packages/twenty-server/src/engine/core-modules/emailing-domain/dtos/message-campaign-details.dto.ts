import { Field, ObjectType } from '@nestjs/graphql';

import { MessageCampaignRecipientDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-recipient.dto';
import { MessageCampaignSummaryDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-summary.dto';

@ObjectType('MessageCampaignDetails')
export class MessageCampaignDetailsDTO extends MessageCampaignSummaryDTO {
  @Field(() => String, { nullable: true })
  body: string | null;

  @Field(() => String, { nullable: true })
  unsubscribeTopicId: string | null;

  @Field(() => Boolean)
  canEdit: boolean;

  @Field(() => [MessageCampaignRecipientDTO])
  recipients: MessageCampaignRecipientDTO[];

  @Field(() => [String])
  draftPersonIds: string[];
}
