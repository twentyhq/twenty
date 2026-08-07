import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { InboxItemBinding } from 'src/engine/core-modules/inbox/enums/inbox-item-binding.enum';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxItemStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-status.enum';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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

  // Clients resolve OPEN_THREAD and OPEN_SUBJECT_RECORD themselves; every other
  // kind goes back to executeInboxItemAction.
  @Field(() => String)
  handlerKind: string;
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

  @Field(() => InboxItemBinding)
  binding: InboxItemBinding;

  @Field(() => [InboxItemActionDTO])
  actions: InboxItemActionDTO[];
}

@ObjectType('InboxItem')
export class InboxItemDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => InboxItemTypeDTO)
  inboxItemType: InboxItemTypeDTO;

  @Field(() => InboxItemStatus)
  status: InboxItemStatus;

  @Field(() => InboxItemPriority)
  priority: InboxItemPriority;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  preview: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  payload: Record<string, unknown> | null;

  @Field(() => Date, { nullable: true })
  readAt: Date | null;

  @Field(() => Date, { nullable: true })
  snoozedUntil: Date | null;

  @Field(() => UUIDScalarType, { nullable: true })
  threadId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  subjectObjectMetadataId: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  subjectRecordId: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
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
