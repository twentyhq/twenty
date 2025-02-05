import { Field, InputType } from '@nestjs/graphql';

import { WorkflowActionType } from 'twenty-shared';

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
}
