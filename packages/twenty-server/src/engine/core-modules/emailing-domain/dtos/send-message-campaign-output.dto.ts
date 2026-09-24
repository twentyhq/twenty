import { Field, Int, ObjectType } from '@nestjs/graphql';

import { CampaignAudiencePreviewDTO } from 'src/engine/core-modules/emailing-domain/dtos/campaign-audience-preview.dto';

@ObjectType()
export class SendMessageCampaignOutputDTO {
  @Field(() => String)
  campaignId: string;

  @Field(() => Int)
  queuedCount: number;

  @Field(() => CampaignAudiencePreviewDTO)
  audience: CampaignAudiencePreviewDTO;
}
