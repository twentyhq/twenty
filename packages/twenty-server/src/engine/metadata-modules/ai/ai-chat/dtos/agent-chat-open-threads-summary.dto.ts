import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AgentChatOpenThreadsSummary')
export class AgentChatOpenThreadsSummaryDTO {
  @Field(() => Int)
  openThreadCount: number;

  @Field(() => Int)
  unreadOpenThreadCount: number;

  @Field(() => Int)
  needsInputThreadCount: number;

  @Field(() => Int)
  mentionThreadCount: number;

  @Field(() => Int)
  assignedToMeThreadCount: number;

  @Field(() => Int)
  assignedThreadCount: number;

  @Field(() => Int)
  unassignedThreadCount: number;

  @Field(() => Boolean)
  hasUnreadOpenThread: boolean;

  @Field(() => Boolean)
  hasUnreadMentionThread: boolean;

  @Field(() => Boolean)
  hasUnreadAssignedThread: boolean;
}
