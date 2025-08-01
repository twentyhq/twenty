import { Field, InputType } from '@nestjs/graphql';

import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowStepPositionInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-input.dto';

@InputType()
export class CreateWorkflowVersionStepInput {
  @Field(() => String, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionId: string;

  @Field(() => String, {
    description: 'New step type',
    nullable: false,
  })
  stepType: WorkflowActionType;

  @Field(() => String, {
    description: 'Parent step ID',
    nullable: true,
  })
  parentStepId?: string;

  @Field(() => String, {
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
