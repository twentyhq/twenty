import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatThreadParticipant')
export class AgentChatThreadParticipantDTO {
  @Field(() => UUIDScalarType)
  threadId: string;

  @Field(() => Date, { nullable: true })
  lastReadAt: Date | null;

  @Field(() => Date, { nullable: true })
  archivedAt: Date | null;

  @Field(() => Date, { nullable: true })
  snoozedUntil: Date | null;
}
