import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatChannelRole')
export class AgentChatChannelRoleDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => Boolean)
  canAccessAllAgentChatChannels: boolean;
}
