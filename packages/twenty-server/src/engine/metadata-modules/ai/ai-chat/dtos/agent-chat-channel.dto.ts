import { Field, ID, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';

@ObjectType('AgentChatChannel')
export class AgentChatChannelDTO {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => AgentChatChannelVisibility)
  visibility: AgentChatChannelVisibility;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  targetObjectMetadataId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  targetRecordId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  createdByUserWorkspaceId: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
