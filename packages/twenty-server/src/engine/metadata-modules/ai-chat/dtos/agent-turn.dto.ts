import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

import { AgentTurnEvaluationDTO } from './agent-turn-evaluation.dto';
import { AgentMessageDTO } from './agent-message.dto';

@ObjectType('AgentTurn')
export class AgentTurnDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  agentId: string | null;

  @Field(() => [AgentTurnEvaluationDTO])
  evaluations: AgentTurnEvaluationDTO[];

  @Field(() => [AgentMessageDTO])
  messages: AgentMessageDTO[];

  @Field()
  createdAt: Date;
}
