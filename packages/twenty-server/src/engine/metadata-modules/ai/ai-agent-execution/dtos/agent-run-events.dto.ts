import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type AgentRunEvent } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// each event is an AgentRunEvent (twenty-shared), a union GraphQL cannot express
@ObjectType('AgentRunEvents')
export class AgentRunEventsDTO {
  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => [GraphQLJSON])
  events: AgentRunEvent[];
}
