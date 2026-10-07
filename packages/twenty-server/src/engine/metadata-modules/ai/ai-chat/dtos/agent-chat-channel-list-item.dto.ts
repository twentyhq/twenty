import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';

@ObjectType('AgentChatChannelListItem')
export class AgentChatChannelListItemDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => String, { nullable: true })
  color: string | null;

  @Field(() => AgentChatChannelVisibility)
  visibility: AgentChatChannelVisibility;

  @Field(() => Boolean)
  isMember: boolean;

  @Field(() => Boolean)
  canManage: boolean;

  @Field(() => Int)
  memberCount: number;
}
