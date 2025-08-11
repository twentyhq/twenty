import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@InputType()
export class ComputeStepOutputSchemaInput {
  @Field(() => graphqlTypeJson, {
    description: 'Step JSON format',
    nullable: false,
  })
  step: WorkflowTrigger | WorkflowAction;
}
