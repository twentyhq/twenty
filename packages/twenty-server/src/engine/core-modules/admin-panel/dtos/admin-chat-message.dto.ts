import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AdminChatMessagePartDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-message-part.dto';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';

// Ensure the enum is registered with GraphQL
import 'src/engine/core-modules/admin-panel/enums/agent-message-role.enum';

@ObjectType('AdminChatMessage')
export class AdminChatMessageDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => AgentMessageRole)
  role: AgentMessageRole;

  @Field(() => [AdminChatMessagePartDTO])
  parts: AdminChatMessagePartDTO[];

  @Field(() => Date)
  createdAt: Date;
}
