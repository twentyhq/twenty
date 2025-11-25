import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentTurn')
export class AgentTurnDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  agentId: string | null;

  @Field()
  createdAt: Date;
}

