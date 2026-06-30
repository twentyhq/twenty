import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@ObjectType('WorkflowVersionDTO')
export class WorkflowVersionDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;

  @Field(() => UUIDScalarType)
  workflowId: string;

  @Field(() => String)
  status: WorkflowVersionStatus;

  @Field(() => GraphQLJSON, { nullable: true })
  trigger: WorkflowTrigger | null;

  @Field(() => GraphQLJSON, { nullable: true })
  steps: WorkflowAction[] | null;
}
