import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type AgentRunEvent } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentRunEventPayload')
export class AgentRunEventPayloadDTO {
  @Field(() => UUIDScalarType)
  threadId: string;

  // null on a keepalive, which only keeps the connection open
  @Field(() => GraphQLJSON, { nullable: true })
  event: AgentRunEvent | null;
}
