import { Field, Int, ObjectType } from '@nestjs/graphql';

import { CampaignSkippedRecipientsDTO } from 'src/engine/core-modules/emailing-domain/dtos/campaign-skipped-recipients.dto';

@ObjectType()
export class SendMessageCampaignOutputDTO {
  @Field(() => String)
  campaignId: string;

  @Field(() => Int)
  queuedCount: number;

  @Field(() => CampaignSkippedRecipientsDTO)
  skipped: CampaignSkippedRecipientsDTO;
}
