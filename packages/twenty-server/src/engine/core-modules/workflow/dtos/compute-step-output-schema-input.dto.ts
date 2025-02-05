import { Field, InputType } from '@nestjs/graphql';

import { WorkflowAction, WorkflowTrigger } from 'twenty-shared';
import graphqlTypeJson from 'graphql-type-json';

@InputType()
export class ComputeStepOutputSchemaInput {
  @Field(() => graphqlTypeJson, {
    description: 'Step JSON format',
    nullable: false,
  })
  step: WorkflowTrigger | WorkflowAction;
}
