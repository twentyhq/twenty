import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CoreWorkflowDailyRunCountDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-daily-run-count.dto';
import { CoreWorkflowFailedRunDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-failed-run.dto';

@ObjectType('CoreWorkflowRunInsights')
export class CoreWorkflowRunInsightsDTO {
  @Field(() => UUIDScalarType)
  coreWorkflowId: string;

  @Field(() => Int, {
    description:
      'Runs over the last 14 days, the same window as the workflows list run count',
  })
  runCount: number;

  @Field(() => Int, {
    description: 'Failed runs over the same 14 days',
  })
  failedRunCount: number;

  @Field(() => Boolean, {
    description:
      'True when run retention may have deleted runs from the window, so the counts are lower bounds',
  })
  isRunCountLowerBound: boolean;

  @Field(() => Float, {
    nullable: true,
    description: 'Average duration of completed runs over the same 14 days',
  })
  averageDurationInMs: number | null;

  @Field(() => [CoreWorkflowDailyRunCountDTO], {
    description:
      'One entry per calendar day of the last 14 days in the requested time zone, oldest first',
  })
  dailyRunCounts: CoreWorkflowDailyRunCountDTO[];

  @Field(() => [CoreWorkflowFailedRunDTO], {
    description: 'Most recent failed runs first',
  })
  recentFailedRuns: CoreWorkflowFailedRunDTO[];
}
