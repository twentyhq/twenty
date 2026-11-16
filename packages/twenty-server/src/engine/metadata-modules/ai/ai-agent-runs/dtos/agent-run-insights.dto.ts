import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AgentDailyRunCountDTO } from 'src/engine/metadata-modules/ai/ai-agent-runs/dtos/agent-daily-run-count.dto';

@ObjectType('AgentRunInsights')
export class AgentRunInsightsDTO {
  @Field(() => UUIDScalarType)
  agentId: string;

  @Field(() => Int, {
    description:
      'Runs over the last 14 days, the same window as the agents list run count',
  })
  runCount: number;

  @Field(() => Float, {
    description: 'Input and output tokens used over the same 14 days',
  })
  tokenCount: number;

  @Field(() => Float, {
    description: 'Credits spent over the same 14 days',
  })
  credits: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Average duration of completed runs over the same 14 days',
  })
  averageDurationInMs: number | null;

  @Field(() => [AgentDailyRunCountDTO], {
    description:
      'One entry per calendar day of the last 14 days in the requested time zone, oldest first',
  })
  dailyRunCounts: AgentDailyRunCountDTO[];
}
