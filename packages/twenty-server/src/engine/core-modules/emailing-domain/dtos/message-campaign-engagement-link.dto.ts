import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MessageCampaignEngagementLinkDTO {
  @Field(() => String)
  authoredUrl: string;

  @Field(() => Int)
  uniqueClickers: number;

  @Field(() => Int)
  totalClicks: number;
}
