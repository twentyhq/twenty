import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MessageCampaignEngagementBucketDTO {
  @Field(() => Date)
  bucketStart: Date;

  @Field(() => Int)
  opens: number;

  @Field(() => Int)
  clicks: number;
}
