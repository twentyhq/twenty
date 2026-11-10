import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { CoreWorkflowRecentRunDTO } from 'src/engine/core-modules/workflow/dtos/core-workflow-recent-run.dto';

@ObjectType('CoreWorkflowRunSummary')
export class CoreWorkflowRunSummaryDTO {
  @Field(() => UUIDScalarType)
  coreWorkflowId: string;

  @Field(() => Int)
  runCountLast14Days: number;

  @Field(() => Boolean, {
    description:
      'True when run retention may have deleted runs from the window, so runCountLast14Days is a lower bound',
  })
  isRunCountLowerBound: boolean;

  @Field(() => [CoreWorkflowRecentRunDTO], {
    description: 'Most recent runs first',
  })
  recentRuns: CoreWorkflowRecentRunDTO[];
}
