import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowStep } from 'src/modules/workflow/workflow-executor/types/workflow-action.type';

@InputType()
export class ComputeStepOutputSchemaInput {
  @Field(() => graphqlTypeJson, {
    description: 'Step JSON format',
    nullable: false,
  })
  step: WorkflowTrigger | WorkflowStep;
}
