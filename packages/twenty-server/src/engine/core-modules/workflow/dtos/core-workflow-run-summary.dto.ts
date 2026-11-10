import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

@ObjectType('CoreWorkflowRecentRun')
export class CoreWorkflowRecentRunDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => WorkflowRunStatus)
  status: WorkflowRunStatus;

  @Field(() => String)
  createdAt: string;
}

@ObjectType('CoreWorkflowRunSummary')
export class CoreWorkflowRunSummaryDTO {
  @Field(() => UUIDScalarType)
  coreWorkflowId: string;

  @Field(() => Int)
  runCountLast14Days: number;

  @Field(() => [CoreWorkflowRecentRunDTO], {
    description: 'Most recent runs first',
  })
  recentRuns: CoreWorkflowRecentRunDTO[];
}
