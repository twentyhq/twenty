import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatThreadParticipant')
export class AgentChatThreadParticipantDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => Date, { nullable: true })
  lastReadAt: Date | null;

  @Field(() => Date, { nullable: true })
  archivedAt: Date | null;

  @Field(() => Date, { nullable: true })
  snoozedUntil: Date | null;

  // Orders the copies a member's apps receive, so an older one never wins
  @Field(() => Date)
  updatedAt: Date;
}
