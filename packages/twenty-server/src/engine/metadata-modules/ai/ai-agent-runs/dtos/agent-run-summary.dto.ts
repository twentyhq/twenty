import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentRecentRunDTO } from 'src/engine/metadata-modules/ai/ai-agent-runs/dtos/agent-recent-run.dto';

@ObjectType('AgentRunSummary')
export class AgentRunSummaryDTO {
  @Field(() => UUIDScalarType)
  agentId: string;

  @Field(() => Int)
  runCountLast14Days: number;

  @Field(() => [AgentRecentRunDTO], {
    description: 'Most recent runs first',
  })
  recentRuns: AgentRecentRunDTO[];
}
