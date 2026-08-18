import { Field, Int, ObjectType } from '@nestjs/graphql';

import { AdminChatThreadListItemDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-thread-list-item.dto';

@ObjectType('PaginatedAdminChatThreads')
export class PaginatedAdminChatThreadsDTO {
  @Field(() => [AdminChatThreadListItemDTO])
  threads: AdminChatThreadListItemDTO[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
