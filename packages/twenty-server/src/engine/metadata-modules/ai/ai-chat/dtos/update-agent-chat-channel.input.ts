import { Field, Float, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('UpdateAgentChatChannelInput')
export class UpdateAgentChatChannelInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  icon?: string | null;

  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => Float, { nullable: true })
  position?: number;

  @Field(() => [UUIDScalarType], { nullable: true })
  roleIds?: string[];
}
