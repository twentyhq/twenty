import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentChatChannelAssignmentFilter } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-assignment-filter.enum';
import { AgentChatChannelThreadStatus } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-thread-status.enum';
import { AgentChatInboxViewKind } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-view-kind.enum';

@InputType('AgentChatInboxViewInput')
export class AgentChatInboxViewInput {
  @Field(() => AgentChatInboxViewKind)
  kind: AgentChatInboxViewKind;

  // Required by the CHANNEL view
  @Field(() => UUIDScalarType, { nullable: true })
  channelId?: string;

  @Field(() => AgentChatChannelThreadStatus, { nullable: true })
  channelStatus?: AgentChatChannelThreadStatus;

  @Field(() => AgentChatChannelAssignmentFilter, { nullable: true })
  assignment?: AgentChatChannelAssignmentFilter;
}
