import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import {
  InboxItemContextDTO,
  InboxItemRecordDTO,
} from 'src/engine/core-modules/inbox/dtos/inbox-item-context.dto';
import { InboxItemFieldType } from 'src/engine/core-modules/inbox/enums/inbox-item-field-type.enum';
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

  @Field(() => InboxItemFieldType)
  type: InboxItemFieldType;

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

@ObjectType('InboxQueue')
export class InboxQueueDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  label: string;

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

  @Field(() => String, { nullable: true })
  icon: string | null;

  // Evaluated server side and never recomputed by the client, so one place
  // decides what counts as handled.
  @Field(() => InboxItemScope)
  scope: InboxItemScope;

  @Field(() => Boolean)
  isUnread: boolean;

  @Field(() => InboxItemPriority)
  priority: InboxItemPriority;

  // A client that acts on what it read sends this back, so a stale action loses
  // instead of overwriting.
  @Field(() => Int)
  version: number;

  @Field(() => String)
  title: string;

  // The list row's second line, a column like the title rather than a lookup
  // into a blob.
  @Field(() => String, { nullable: true })
  summary: string | null;

  @Field(() => InboxItemContextDTO)
  context: InboxItemContextDTO;

  // What the item is about, in the order the pane draws it.
  @Field(() => [InboxItemRecordDTO])
  records: InboxItemRecordDTO[];

  // Empty is a valid plan: doing it just archives the item.
  @Field(() => [InboxItemToolCallDTO])
  toolCalls: InboxItemToolCallDTO[];

  @Field(() => Date)
  lastEventAt: Date;

  @Field(() => UUIDScalarType, { nullable: true })
  queueId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  assigneeUserWorkspaceId: string | null;

  // Computed server side, so the client never has to know its own user
  // workspace id to tell whose work this is.
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
