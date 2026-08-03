import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('MessageCampaignSummary')
export class MessageCampaignSummaryDTO {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  subject: string | null;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  fromAddress: string | null;

  @Field(() => String, { nullable: true })
  listId: string | null;

  @Field(() => String, { nullable: true })
  listName: string | null;

  @Field(() => String, { nullable: true })
  creatorWorkspaceMemberId: string | null;

  @Field(() => String)
  creatorName: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  sentAt: Date | null;

  @Field(() => Int)
  recipientCount: number;

  @Field(() => Int)
  sentCount: number;

  @Field(() => Int)
  failedCount: number;

  @Field(() => Int)
  bouncedCount: number;

  @Field(() => Int)
  complainedCount: number;
}
