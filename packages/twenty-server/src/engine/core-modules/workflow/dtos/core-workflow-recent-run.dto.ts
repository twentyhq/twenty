import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

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
