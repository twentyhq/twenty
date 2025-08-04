import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowStepPositionInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-input.dto';

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

  // Typed String as it can be 'trigger'
  @Field(() => String, {
    description: 'Parent step ID',
    nullable: true,
  })
  parentStepId?: string;

  @Field(() => UUIDScalarType, {
    description: 'Next step ID',
    nullable: true,
  })
  nextStepId?: string;

  @Field(() => WorkflowStepPositionInput, {
    description: 'Step position',
    nullable: true,
  })
  position?: WorkflowStepPositionInput;
}
