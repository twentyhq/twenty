import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

registerEnumType(WorkflowVersionStatus, {
  name: 'CoreWorkflowVersionStatus',
});

@ObjectType('CoreWorkflowVersionDTO')
export class CoreWorkflowVersionDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  label: string;

  @Field(() => WorkflowVersionStatus)
  status: WorkflowVersionStatus;

  @Field(() => UUIDScalarType, { nullable: true })
  workspaceWorkflowVersionId: string | null;

  @Field(() => UUIDScalarType)
  workspaceWorkflowId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  trigger: WorkflowTrigger | null;

  @Field(() => GraphQLJSON, { nullable: true })
  steps: WorkflowAction[] | null;

  @Field(() => String)
  createdAt: string;
}
