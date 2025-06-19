import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

@InputType()
export class RunWorkflowVersionInput {
  @Field(() => String, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionId: string;

  @Field(() => String, {
    description: 'Workflow run ID',
    nullable: true,
  })
  workflowRunId?: string | null;

  @Field(() => graphqlTypeJson, {
    description: 'Execution result in JSON format',
    nullable: true,
  })
  payload?: JSON;
}
