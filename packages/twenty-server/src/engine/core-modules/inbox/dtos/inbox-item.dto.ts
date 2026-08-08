import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
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

@ObjectType('InboxItemAction')
export class InboxItemActionDTO {
  @Field(() => String)
  key: string;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => Boolean)
  isPrimary: boolean;

  // Set when the client resolves the action itself rather than transitioning
  // the item: OPEN_THREAD or OPEN_SUBJECT_RECORD.
  @Field(() => String, { nullable: true })
  navigationKind: string | null;

  // Set when the action transitions the item. The client never interprets it;
  // it sends the action key back and the server applies the transition.
  @Field(() => String, { nullable: true })
  transitionKind: string | null;

  @Field(() => [InboxItemFieldDTO])
  inputSchema: InboxItemFieldDTO[];
}

@ObjectType('InboxItemOutcome')
export class InboxItemOutcomeDTO {
  @Field(() => String)
  key: string;

  @Field(() => String)
  label: string;
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

  @Field(() => [InboxItemActionDTO])
  actions: InboxItemActionDTO[];

  @Field(() => [InboxItemOutcomeDTO])
  outcomes: InboxItemOutcomeDTO[];
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

  @Field(() => String, { nullable: true })
  preview: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  payload: Record<string, unknown> | null;

  @Field(() => String, { nullable: true })
  outcome: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  result: Record<string, unknown> | null;

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

  // The workspace member behind the assignee, so a shared list can show a face
  // without the client resolving user workspaces itself.
  @Field(() => UUIDScalarType, { nullable: true })
  assigneeUserId: string | null;

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
