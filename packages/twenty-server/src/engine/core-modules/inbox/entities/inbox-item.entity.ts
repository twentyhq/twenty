import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CREATE_INBOX_CORE_TABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-30/create-inbox-core-tables-upgrade-command-name.constant';
import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// One thing asking for one person's attention. A conversation, a question from
// an agent, an approval, a failed run: same row, different type.
//
// The item stores no verdict about its subject. It stores when the subject last
// did something (lastEventAt, written only by producers) and when the assignee
// last cleared it (clearedAt, written only by the assignee), and whether it
// wants attention is the comparison between them. Two writers, two columns, so
// neither can overwrite the other and a clear can never swallow an event that
// arrived while it was in flight.
@Entity({ name: 'inboxItem', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_INBOX_CORE_TABLES_UPGRADE_COMMAND_NAME,
})
// Work never vanishes. An item is addressed to a shared queue, to one person,
// or to both, and the database refuses the fourth case.
@Check(
  'CHK_INBOX_ITEM_ADDRESSED',
  '("queueId" IS NOT NULL) OR ("assigneeUserWorkspaceId" IS NOT NULL)',
)
// One row per slot per inbox, for the slot's whole life. Concurrent producers
// collide here and fold instead of duplicating, and a cleared item is revived
// by the next event rather than replaced by a second row. A queue's slot belongs
// to the queue, so taking an item does not move it to a different slot.
@Index(
  'IDX_INBOX_ITEM_QUEUE_SLOT_KEY_UNIQUE',
  ['workspaceId', 'queueId', 'slotKey'],
  { unique: true, where: `"slotKey" IS NOT NULL AND "queueId" IS NOT NULL` },
)
@Index(
  'IDX_INBOX_ITEM_SLOT_KEY_UNIQUE',
  ['workspaceId', 'assigneeUserWorkspaceId', 'slotKey'],
  { unique: true, where: `"slotKey" IS NOT NULL AND "queueId" IS NULL` },
)
@Index('IDX_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID_LAST_EVENT_AT', [
  'assigneeUserWorkspaceId',
  'lastEventAt',
])
@Index('IDX_INBOX_ITEM_QUEUE_ID_LAST_EVENT_AT', ['queueId', 'lastEventAt'])
@Index('IDX_INBOX_ITEM_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_INBOX_ITEM_THREAD_ID', ['threadId'])
export class InboxItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'workspaceId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_WORKSPACE_ID',
  })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  inboxItemTypeId: string;

  @ManyToOne(() => InboxItemTypeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'inboxItemTypeId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_INBOX_ITEM_TYPE_ID',
  })
  inboxItemType: EntityRelation<InboxItemTypeEntity>;

  @Column({
    type: 'enum',
    enum: Object.values(InboxItemPriority),
    nullable: false,
    default: InboxItemPriority.UPDATE,
  })
  priority: InboxItemPriority;

  @Column({ nullable: false, type: 'varchar' })
  title: string;

  @Column({ nullable: true, type: 'varchar' })
  preview: string | null;

  @Column({ nullable: true, type: 'jsonb' })
  payload: JsonbProperty<InboxItemPayload> | null;

  // Written by producers only. Also what the list is ordered by, so retitling
  // or reading an item cannot reorder it.
  //
  // Everything compared against this one is stamped by the database rather
  // than by whichever app server handled the request, so the comparison
  // reflects which write Postgres saw last and not whose clock ran fast.
  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'clock_timestamp()',
  })
  lastEventAt: Date;

  // Written by the assignee only. Null means never cleared; an older value than
  // lastEventAt means the clear has been superseded by newer activity.
  @Column({ type: 'timestamptz', nullable: true })
  clearedAt: Date | null;

  // A clear that expires. This is what a snooze is: the item comes back when
  // this passes, or sooner if its subject does something first. Compared only
  // against the reading request's own clock, never against lastEventAt.
  @Column({ type: 'timestamptz', nullable: true })
  resurfaceAt: Date | null;

  // Null on a cleared item means nobody cleared it: its subject went away.
  @Column({ nullable: true, type: 'uuid' })
  clearedByUserWorkspaceId: string | null;

  // Which of the type's declared outcomes the last clear used, and whatever
  // that outcome declared it carries. Metadata about the clear, not state.
  @Column({ nullable: true, type: 'varchar' })
  outcome: string | null;

  @Column({ nullable: true, type: 'jsonb' })
  result: JsonbProperty<InboxItemPayload> | null;

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @Column({ nullable: true, type: 'uuid' })
  threadId: string | null;

  @ManyToOne(() => AgentChatThreadEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'threadId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_THREAD_ID',
  })
  thread: EntityRelation<AgentChatThreadEntity> | null;

  // Points at a workspace-schema record, which lives in another schema and so
  // cannot be a foreign key
  @Column({ nullable: true, type: 'uuid' })
  subjectObjectMetadataId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  subjectRecordId: string | null;

  // The shared inbox this belongs to, if it is shared work. It stays set after
  // someone takes the item, so a claimed conversation is still the queue's.
  @Column({ nullable: true, type: 'uuid' })
  queueId: string | null;

  @ManyToOne(() => InboxQueueEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'queueId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_QUEUE_ID',
  })
  queue: EntityRelation<InboxQueueEntity> | null;

  // Who has taken it. Null on a queue item means nobody has yet, which is a
  // state the queue exists to represent rather than a missing value.
  @Column({ nullable: true, type: 'uuid' })
  assigneeUserWorkspaceId: string | null;

  @ManyToOne(() => UserWorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'assigneeUserWorkspaceId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID',
  })
  assigneeUserWorkspace: EntityRelation<UserWorkspaceEntity> | null;

  // Two upserts naming the same slot are the same piece of work. This is the
  // whole folding rule: one item per slot, and no slot means one item per call.
  @Column({ nullable: true, type: 'varchar' })
  slotKey: string | null;

  // Bumped by every transition. A caller that read the item at version N can
  // only transition it while it is still at N, so two people clearing the same
  // approval with different outcomes cannot both win.
  @Column({ nullable: false, type: 'integer', default: 1 })
  version: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
