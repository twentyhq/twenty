import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

@ObjectType('AgentRun')
export class AgentRunDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => String, { nullable: true })
  threadTitle: string | null;

  @Field(() => AgentTurnStatus)
  status: AgentTurnStatus;

  @Field(() => String, { nullable: true })
  errorMessage: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  startedAt: Date | null;

  @Field(() => Date, { nullable: true })
  endedAt: Date | null;

  @Field(() => String, { nullable: true })
  modelId: string | null;

  @Field(() => Int, { nullable: true })
  inputTokens: number | null;

  @Field(() => Int, { nullable: true })
  outputTokens: number | null;

  @Field(() => Float, { nullable: true })
  credits: number | null;

  @Field(() => String)
  creatorSource: string;

  @Field(() => String)
  creatorName: string;

  @Field(() => String, { nullable: true })
  input: string | null;

  @Field(() => String, { nullable: true })
  reply: string | null;

  @Field(() => [String])
  toolNames: string[];
}
