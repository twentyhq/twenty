import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatThreadPreview')
export class AgentChatThreadPreviewDTO {
  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => String, { nullable: true })
  lastMessageRole: string | null;

  @Field(() => String, { nullable: true })
  lastMessageText: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  lastMessageSenderWorkspaceMemberId: string | null;

  @Field(() => [UUIDScalarType])
  memberIds: string[];
}
