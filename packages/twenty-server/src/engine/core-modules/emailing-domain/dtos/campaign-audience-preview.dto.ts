import { Field, Int, ObjectType } from '@nestjs/graphql';

// Pre-send breakdown of a campaign's audience. The categories are disjoint and
// sum to totalMembers (minus over-cap recipients), so they can be shown as a
// hint: "<totalMembers> in this list — <sendable> sendable (...)".
@ObjectType()
export class CampaignAudiencePreviewDTO {
  @Field(() => Int)
  totalMembers: number;

  @Field(() => Int)
  withoutEmail: number;

  @Field(() => Int)
  duplicateEmails: number;

  @Field(() => Int)
  globallyUnsubscribed: number;

  @Field(() => Int)
  topicUnsubscribed: number;

  @Field(() => Int)
  sendable: number;
}
