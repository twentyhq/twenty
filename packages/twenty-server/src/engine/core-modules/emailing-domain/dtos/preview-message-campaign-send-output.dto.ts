import { Field, ObjectType } from '@nestjs/graphql';

import { CampaignAudiencePreviewDTO } from 'src/engine/core-modules/emailing-domain/dtos/campaign-audience-preview.dto';
import { MessageCampaignSendBlockerDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-send-blocker.dto';

@ObjectType()
export class PreviewMessageCampaignSendOutputDTO {
  @Field(() => CampaignAudiencePreviewDTO, { nullable: true })
  audience: CampaignAudiencePreviewDTO | null;

  @Field(() => [MessageCampaignSendBlockerDTO])
  blockers: MessageCampaignSendBlockerDTO[];
}
