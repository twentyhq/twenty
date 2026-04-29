import { Field, ObjectType } from '@nestjs/graphql';

import { IsDateString } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentMessagePartDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message-part.dto';

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

  @Field()
  role: 'system' | 'user' | 'assistant';

  @Field()
  status: 'queued' | 'sent';

  @Field(() => [AgentMessagePartDTO])
  parts: AgentMessagePartDTO[];

  @IsDateString()
  @Field(() => Date, { nullable: true })
  processedAt: Date | null;

  @IsDateString()
  @Field()
  createdAt: Date;
}
