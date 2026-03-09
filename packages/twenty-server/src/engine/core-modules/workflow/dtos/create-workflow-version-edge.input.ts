import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { WorkflowStepConnectionOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/WorkflowStepCreationOptions';

@InputType()
export class CreateWorkflowVersionEdgeInput {
  @Field(() => String, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionId: string;

  @Field(() => String, {
    description: 'Workflow version source step ID',
    nullable: false,
  })
  source: string;

  @Field(() => String, {
    description: 'Workflow version target step ID',
    nullable: false,
  })
  target: string;

  @Field(() => graphqlTypeJson, {
    description: 'Workflow version source step connection options',
    nullable: true,
  })
  sourceConnectionOptions?: WorkflowStepConnectionOptions;
}
