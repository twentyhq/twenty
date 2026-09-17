import { Field, ID, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatChannelRole')
export class AgentChatChannelRoleDTO {
  @Field(() => ID)
  id: string;

  @Field(() => UUIDScalarType)
  channelId: string;

  @Field(() => UUIDScalarType)
  roleId: string;

  @Field()
  createdAt: Date;
}
