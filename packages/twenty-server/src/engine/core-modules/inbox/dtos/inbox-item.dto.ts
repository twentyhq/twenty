import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { InboxItemOutcome } from 'src/engine/core-modules/inbox/enums/inbox-item-outcome.enum';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxItemToolCallStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-tool-call-status.enum';
import { InboxItemScope } from 'src/engine/core-modules/inbox/enums/inbox-item-scope.enum';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('InboxItemField')
export class InboxItemFieldDTO {
  @Field(() => String)
  key: string;

  @Field(() => String)
  label: string;

  @Field(() => String)
  type: string;

  @Field(() => Boolean)
  isRequired: boolean;
}

@ObjectType('InboxItemToolCall')
export class InboxItemToolCallDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => Int)
  position: number;

  @Field(() => String)
  toolName: string;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => InboxItemToolCallStatus)
  status: InboxItemToolCallStatus;

  @Field(() => [InboxItemFieldDTO])
  inputSchema: InboxItemFieldDTO[];

  @Field(() => GraphQLJSON)
  proposedInput: Record<string, unknown>;

  @Field(() => GraphQLJSON, { nullable: true })
  editedInput: Record<string, unknown> | null;

  @Field(() => GraphQLJSON, { nullable: true })
  output: Record<string, unknown> | null;

  @Field(() => String, { nullable: true })
  error: string | null;
}

@ObjectType('InboxItemType')
export class InboxItemTypeDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  key: string;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  icon: string | null;
}

// A shared inbox, with the counts the navigation needs to badge it.
@ObjectType('InboxQueue')
export class InboxQueueDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => Int)
  unread: number;

  @Field(() => Int)
  needsAction: number;
}

@ObjectType('InboxItem')
export class InboxItemDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => InboxItemTypeDTO)
  inboxItemType: InboxItemTypeDTO;

  // Where the item currently sits, evaluated server side. The client never
  // recomputes it, so there is one place that decides what is handled.
  @Field(() => InboxItemScope)
  scope: InboxItemScope;

  @Field(() => Boolean)
  isUnread: boolean;

  @Field(() => InboxItemPriority)
  priority: InboxItemPriority;

  // Bumped by every transition. A client that acts on what it read sends this
  // back so a stale action loses instead of overwriting.
  @Field(() => Int)
  version: number;

  @Field(() => String)
  title: string;

  // Summary, source and entity graph: whatever the producer knew
  @Field(() => GraphQLJSON)
  context: Record<string, unknown>;

  // The calls the item proposes, in order. Empty is a valid plan: doing it
  // just marks the item done.
  @Field(() => [InboxItemToolCallDTO])
  toolCalls: InboxItemToolCallDTO[];

  @Field(() => InboxItemOutcome, { nullable: true })
  outcome: InboxItemOutcome | null;

  // When the subject last did something. Also what the list is ordered by.
  @Field(() => Date)
  lastEventAt: Date;

  // Set when the item belongs to a shared inbox, whether or not anyone has
  // taken it yet.
  @Field(() => UUIDScalarType, { nullable: true })
  queueId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  assigneeUserWorkspaceId: string | null;

  // Computed server side like scope and isUnread, so the client never has to
  // know its own user workspace id to tell whose work this is.
  @Field(() => Boolean)
  isAssignedToMe: boolean;

  @Field(() => UUIDScalarType, { nullable: true })
  threadId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  subjectObjectMetadataId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  subjectRecordId: string | null;
}

@ObjectType('InboxCounts')
export class InboxCountsDTO {
  @Field(() => Int)
  unread: number;

  @Field(() => Int)
  needsAction: number;

  @Field(() => Int)
  snoozed: number;
}
