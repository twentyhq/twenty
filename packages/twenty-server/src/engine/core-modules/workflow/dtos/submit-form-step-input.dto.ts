import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

@InputType()
export class SubmitFormStepInput {
  @Field(() => String, {
    description: 'Workflow version ID',
    nullable: false,
  })
  stepId: string;

  @Field(() => String, {
    description: 'Workflow run ID',
    nullable: false,
  })
  workflowRunId: string;

  @Field(() => graphqlTypeJson, {
    description: 'Form response in JSON format',
    nullable: false,
  })
  response: JSON;
}
