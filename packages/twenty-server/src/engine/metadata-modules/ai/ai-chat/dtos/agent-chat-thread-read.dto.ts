import { Field, ID, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatThreadRead')
export class AgentChatThreadReadDTO {
  @Field(() => ID)
  id: string;

  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => UUIDScalarType)
  userWorkspaceId: string;

  @Field()
  lastReadAt: Date;

  @Field(() => UUIDScalarType, { nullable: true })
  lastReadMessageId: string | null;
}
