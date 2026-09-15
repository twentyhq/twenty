import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CancelMessageCampaignOutputDTO {
  @Field(() => String)
  campaignId: string;

  @Field(() => Int)
  canceledMessageCount: number;
}
