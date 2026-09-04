import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CampaignAudiencePreviewDTO {
  @Field(() => Int)
  totalMembers: number;

  @Field(() => Int)
  withoutEmail: number;

  @Field(() => Int)
  duplicateEmails: number;

  @Field(() => Int)
  overCap: number;

  @Field(() => Int)
  hardSuppressed: number;

  @Field(() => Int)
  globallyUnsubscribed: number;

  @Field(() => Int)
  topicUnsubscribed: number;

  @Field(() => Int)
  sendable: number;
}
