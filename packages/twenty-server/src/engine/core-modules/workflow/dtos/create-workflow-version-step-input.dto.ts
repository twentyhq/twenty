import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@InputType()
export class CreateWorkflowVersionStepInput {
  @Field(() => UUIDScalarType, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionId: string;

  @Field(() => String, {
    description: 'New step type',
    nullable: false,
  })
  stepType: WorkflowActionType;

  @Field(() => UUIDScalarType, {
    description: 'Parent step ID',
    nullable: true,
  })
  parentStepId?: string;

  @Field(() => UUIDScalarType, {
    description: 'Next step ID',
    nullable: true,
  })
  nextStepId?: string;
}
