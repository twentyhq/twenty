import { Field, ID, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentChatChannelMemberRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-member-role.enum';

@ObjectType('AgentChatChannelMember')
export class AgentChatChannelMemberDTO {
  @Field(() => ID)
  id: string;

  @Field(() => UUIDScalarType)
  channelId: string;

  @Field(() => UUIDScalarType)
  userWorkspaceId: string;

  @Field(() => AgentChatChannelMemberRole)
  role: AgentChatChannelMemberRole;

  @Field()
  createdAt: Date;
}
