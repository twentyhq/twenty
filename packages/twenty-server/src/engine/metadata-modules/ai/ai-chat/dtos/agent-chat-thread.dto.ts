import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatThread')
export class AgentChatThreadDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field({ nullable: true })
  title: string;

  @Field(() => Int)
  totalInputTokens: number;

  @Field(() => Int)
  totalOutputTokens: number;

  @Field(() => Int, { nullable: true })
  contextWindowTokens: number | null;

  @Field(() => Int)
  totalInputCredits: number;

  @Field(() => Int)
  totalOutputCredits: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
