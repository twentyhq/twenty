import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import {
  type AgentRunState,
  type AgentRunStatus,
} from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentRunState')
export class AgentRunStateDTO implements AgentRunState {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => String)
  status: AgentRunStatus;

  @Field(() => GraphQLJSON, { nullable: true })
  result: object | null;

  @Field(() => String, { nullable: true })
  error: string | null;
}
