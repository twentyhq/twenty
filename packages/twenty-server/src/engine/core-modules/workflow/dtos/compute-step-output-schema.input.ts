import { Field, InputType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@InputType()
export class ComputeStepOutputSchemaInput {
  @Field(() => graphqlTypeJson, {
    description: 'Step JSON format',
    nullable: false,
  })
  step: WorkflowTrigger | WorkflowAction;

  @Field(() => UUIDScalarType, {
    description: 'Workflow version ID',
    nullable: true,
  })
  workflowVersionId?: string;
}
