import { Field, InputType } from '@nestjs/graphql';

import { IsUUID } from 'class-validator';

@InputType()
export class CancelMessageCampaignInput {
  @Field(() => String)
  @IsUUID('4')
  campaignId: string;
}
