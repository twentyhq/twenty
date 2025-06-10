import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@InputType()
export class UpdateWorkflowRunStepInput {
  @Field(() => String, {
    description: 'Workflow run ID',
    nullable: false,
  })
  workflowRunId: string;

  @Field(() => graphqlTypeJson, {
    description: 'Step to update in JSON format',
    nullable: false,
  })
  step: WorkflowAction;
}
