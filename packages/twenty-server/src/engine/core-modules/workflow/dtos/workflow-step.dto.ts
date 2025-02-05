import { Field, ObjectType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { WorkflowActionType } from 'twenty-shared';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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
}
