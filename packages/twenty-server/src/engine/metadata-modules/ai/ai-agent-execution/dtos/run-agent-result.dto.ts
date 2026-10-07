import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { type RunAgentResult } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RunAgentResult')
export class RunAgentResultDTO implements RunAgentResult {
  @Field(() => GraphQLJSON, { nullable: true })
  result: object | null;

  @Field(() => String, { nullable: true })
  error: string | null;

  @Field()
  success: boolean;

  @Field()
  isWaiting: boolean;

  @Field(() => UUIDScalarType, { nullable: true })
  threadId: string | null;
}
