import { Field, ObjectType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowStepType } from 'src/modules/workflow/workflow-executor/types/workflow-step.type';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@ObjectType('WorkflowAction')
export class WorkflowActionDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  type: WorkflowActionType | WorkflowStepType;

  @Field(() => graphqlTypeJson)
  settings?: object;

  @Field(() => graphqlTypeJson)
  stepSettings?: object;

  @Field(() => Boolean)
  valid: boolean;
}
