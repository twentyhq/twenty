import { Field, ObjectType } from '@nestjs/graphql';

import { AgentChatThreadDTO } from './agent-chat-thread.dto';

@ObjectType()
export class ChatThreadsPageInfo {
  @Field(() => String, { nullable: true })
  endCursor?: string;

  @Field(() => Boolean)
  hasNextPage: boolean;
}

@ObjectType()
export class ChatThreadsQueryResult {
  @Field(() => [AgentChatThreadDTO])
  threads: AgentChatThreadDTO[];

  @Field(() => ChatThreadsPageInfo)
  pageInfo: ChatThreadsPageInfo;
}
