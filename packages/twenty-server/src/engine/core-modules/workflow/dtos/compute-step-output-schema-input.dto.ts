import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { WorkflowAction } from 'twenty-shared';
import { WorkflowTrigger } from 'twenty-shared';

@InputType()
export class ComputeStepOutputSchemaInput {
  @Field(() => graphqlTypeJson, {
    description: 'Step JSON format',
    nullable: false,
  })
  step: WorkflowTrigger | WorkflowAction;
}
