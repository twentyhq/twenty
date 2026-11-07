import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType('CreateAgentChatChannelInput')
export class CreateAgentChatChannelInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  icon?: string | null;

  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => [UUIDScalarType], { defaultValue: [] })
  roleIds: string[];
}
