import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SaveMessageCampaignDraftOutput')
export class SaveMessageCampaignDraftOutputDTO {
  @Field(() => String)
  campaignId: string;

  @Field(() => Date)
  updatedAt: Date;
}
