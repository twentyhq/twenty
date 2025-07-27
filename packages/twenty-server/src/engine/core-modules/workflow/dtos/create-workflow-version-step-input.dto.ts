import { Field, InputType } from '@nestjs/graphql';

import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

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
  })
  parentStepId: string;

  @Field(() => String, {
    description: 'Next step ID',
    nullable: true,
  })
  nextStepId?: string;
}
