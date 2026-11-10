import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

// Own name: the app SDK schema already declares WorkflowRunStatusEnum for the workflowRun object
const CORE_WORKFLOW_RUN_STATUS = { ...WorkflowRunStatus };

registerEnumType(CORE_WORKFLOW_RUN_STATUS, { name: 'CoreWorkflowRunStatus' });

@ObjectType('CoreWorkflowRecentRun')
export class CoreWorkflowRecentRunDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => CORE_WORKFLOW_RUN_STATUS)
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
