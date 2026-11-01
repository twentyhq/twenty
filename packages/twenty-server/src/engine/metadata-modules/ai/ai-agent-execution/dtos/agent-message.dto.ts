import { Field, ObjectType } from '@nestjs/graphql';

import { IsDateString } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentMessagePartDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message-part.dto';
import { AgentMessageReactionSummaryDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message-reaction-summary.dto';

@ObjectType('AgentMessage')
export class AgentMessageDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  turnId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  agentId: string | null;

  // Fronts cached from the release before still query it for up to a day,
  // and a query naming an unknown field fails as a whole
  @Field(() => UUIDScalarType, { nullable: true })
  senderUserWorkspaceId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  senderWorkspaceMemberId: string | null;

  @Field()
  role: 'system' | 'user' | 'assistant';

  @Field()
  status: 'queued' | 'sent';

  @Field(() => [AgentMessagePartDTO])
  parts: AgentMessagePartDTO[];

  @Field(() => [AgentMessageReactionSummaryDTO])
  reactions: AgentMessageReactionSummaryDTO[];

  @IsDateString()
  @Field(() => Date, { nullable: true })
  processedAt: Date | null;

  @IsDateString()
  @Field()
  createdAt: Date;
}
