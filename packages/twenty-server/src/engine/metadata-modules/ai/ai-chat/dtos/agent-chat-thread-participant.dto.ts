import { Field, ID, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentChatThreadParticipantRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-thread-participant-role.enum';

@ObjectType('AgentChatThreadParticipant')
export class AgentChatThreadParticipantDTO {
  @Field(() => ID)
  id: string;

  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => UUIDScalarType)
  userWorkspaceId: string;

  @Field(() => AgentChatThreadParticipantRole)
  role: AgentChatThreadParticipantRole;

  @Field()
  createdAt: Date;
}
