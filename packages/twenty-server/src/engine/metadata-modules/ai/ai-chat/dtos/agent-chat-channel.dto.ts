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

  @Field(() => [UUIDScalarType])
  roleIds: string[];

  @Field(() => Boolean)
  isCustom: boolean;

  @Field(() => Boolean, { nullable: true })
  isAccessible?: boolean;
}
