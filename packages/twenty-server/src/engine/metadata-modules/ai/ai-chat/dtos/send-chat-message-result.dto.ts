import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('SendChatMessageResult')
export class SendChatMessageResultDTO {
  // null when a retried turn was opened by the agent, without a user message
  @Field(() => String, { nullable: true })
  messageId: string | null;

  @Field(() => Boolean)
  queued: boolean;

  @Field(() => String, { nullable: true })
  streamId?: string;

  // The mentioned members who now follow the chat, leaving out those who
  // cannot reply in it
  @Field(() => [UUIDScalarType], { nullable: true })
  mentionedParticipantWorkspaceMemberIds?: string[];

  // false when the member's own credits alone admitted the send, null when
  // member credits took no part
  @Field(() => Boolean, { nullable: true })
  isWorkspaceAllowanceAvailable?: boolean | null;
}
