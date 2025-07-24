import { Field, ObjectType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowStepPosition } from 'src/engine/core-modules/workflow/dtos/workflow-step-position.dto';

@ObjectType('WorkflowAction')
export class WorkflowActionDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  type: WorkflowActionType;

  @Field(() => graphqlTypeJson)
  settings: object;

  @Field(() => Boolean)
  valid: boolean;

  @Field(() => [UUIDScalarType], { nullable: true })
  nextStepIds?: string[];

  @Field(() => WorkflowStepPosition, { nullable: true })
  position?: object;
}
