import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatThread')
export class AgentChatThreadDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  agentId: string;

  @Field({ nullable: true })
  title: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
