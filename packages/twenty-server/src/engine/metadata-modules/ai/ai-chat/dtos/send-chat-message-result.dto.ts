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

  // Pre-flight hint: an included send does not prove the credit allowance has room again
  @Field(() => Boolean)
  isIncluded: boolean;

  // The mentioned members who now follow the chat, leaving out those who
  // cannot reply in it
  @Field(() => [UUIDScalarType], { nullable: true })
  mentionedParticipantWorkspaceMemberIds?: string[];
}
