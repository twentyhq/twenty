import { Field, ObjectType } from '@nestjs/graphql';

import { AdminChatMessageDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-message.dto';
import { AdminWorkspaceChatThreadDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-workspace-chat-thread.dto';

@ObjectType('AdminChatThreadMessages')
export class AdminChatThreadMessagesDTO {
  @Field(() => AdminWorkspaceChatThreadDTO)
  thread: AdminWorkspaceChatThreadDTO;

  @Field(() => [AdminChatMessageDTO])
  messages: AdminChatMessageDTO[];
}
