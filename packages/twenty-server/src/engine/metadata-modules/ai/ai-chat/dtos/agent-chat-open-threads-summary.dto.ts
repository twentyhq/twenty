import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('AgentChatOpenThreadsSummary')
export class AgentChatOpenThreadsSummaryDTO {
  @Field(() => Int)
  openThreadCount: number;

  @Field(() => Int)
  needsInputThreadCount: number;

  @Field(() => Boolean)
  hasUnreadOpenThread: boolean;

  @Field(() => Boolean)
  hasUnreadMentionThread: boolean;

  @Field(() => Boolean)
  hasUnreadAssignedThread: boolean;
}
