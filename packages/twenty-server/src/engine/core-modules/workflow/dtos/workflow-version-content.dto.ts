import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@ObjectType('WorkflowVersionContent')
export class WorkflowVersionContentDTO {
  @Field(() => UUIDScalarType)
  workflowVersionId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  trigger: WorkflowTrigger | null;

  @Field(() => GraphQLJSON, { nullable: true })
  steps: WorkflowAction[] | null;
}
