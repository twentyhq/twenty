import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

@ObjectType('AgentRecentRun')
export class AgentRecentRunDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => AgentTurnStatus)
  status: AgentTurnStatus;

  @Field(() => Date)
  createdAt: Date;
}
