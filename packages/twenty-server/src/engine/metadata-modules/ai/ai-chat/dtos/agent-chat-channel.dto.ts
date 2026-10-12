import { Field, Float, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatChannel')
export class AgentChatChannelDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => String, { nullable: true })
  color: string | null;

  @Field(() => Float)
  position: number;

  // Roles with access to all channels read its chats too, without being listed
  @Field(() => [UUIDScalarType])
  roleIds: string[];

  // A standard channel, such as General, cannot be deleted
  @Field(() => Boolean)
  isCustom: boolean;

  // Whether the member reads its chats; who manages channels also lists the
  // ones that are not open to them
  @Field(() => Boolean, { nullable: true })
  isAccessible?: boolean;
}
