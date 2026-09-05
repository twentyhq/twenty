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
  OneToMany,
} from 'typeorm';

import { CREATE_INBOX_TABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-39/create-inbox-tables-upgrade-command-name.constant';
import { InboxItemTypeEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-type.entity';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InboxItemOutcome } from 'src/engine/core-modules/inbox/enums/inbox-item-outcome.enum';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';
import { InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { type InboxItemContext } from 'src/engine/core-modules/inbox/types/inbox-item-context.type';

// The item stores no verdict about its subject: it stores when the subject last
// did something (lastEventAt, written only by producers) and when the assignee
// last cleared it (clearedAt, written only by the assignee), and whether it
// wants attention is the comparison between them. Two writers, two columns, so
// a clear can never swallow an event that arrived while it was in flight. Both
// are stamped by Postgres, so the comparison follows which write it saw last
// rather than whose app-server clock ran fast.
@Entity({ name: 'inboxItem', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_INBOX_TABLES_UPGRADE_COMMAND_NAME,
})
// An item is addressed to a shared queue, to one person, or to both, and the
// database refuses the fourth case, so work can never end up unaddressed.
@Check(
  'CHK_INBOX_ITEM_ADDRESSED',
  '("queueId" IS NOT NULL) OR ("assigneeUserWorkspaceId" IS NOT NULL)',
)
// One row per slot per inbox, for the slot's whole life: concurrent producers
// collide here and fold instead of duplicating, and a cleared item is revived
// by the next event rather than replaced by a second row.
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

  // The one payload an item carries, so every producer fills the same shape and
  // every surface reads the same one.
  @Column({ type: 'jsonb', nullable: false, default: {} })
  context: JsonbProperty<InboxItemContext>;

  @OneToMany(() => InboxItemToolCallEntity, (toolCall) => toolCall.inboxItem)
  toolCalls: EntityRelation<InboxItemToolCallEntity[]>;

  // Written by producers only. Also what the list is ordered by, so retitling
  // or reading an item cannot reorder it.
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

  // A clear that expires, which is what a snooze is. Compared only against the
  // reading request's own clock, never against lastEventAt.
  @Column({ type: 'timestamptz', nullable: true })
  resurfaceAt: Date | null;

  // Null on a cleared item means nobody cleared it: its subject went away.
  @Column({ nullable: true, type: 'uuid' })
  clearedByUserWorkspaceId: string | null;

  // Metadata about the last clear, not state of its own.
  @Column({ nullable: true, type: 'varchar' })
  outcome: InboxItemOutcome | null;

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

  // Points at a workspace-schema record, so it cannot be a foreign key.
  @Column({ nullable: true, type: 'uuid' })
  subjectObjectMetadataId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  subjectRecordId: string | null;

  // Stays set after someone takes the item, so a claimed conversation is still
  // the queue's.
  @Column({ nullable: true, type: 'uuid' })
  queueId: string | null;

  @ManyToOne(() => InboxQueueEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'queueId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_QUEUE_ID',
  })
  queue: EntityRelation<InboxQueueEntity> | null;

  // Null on a queue item means nobody has taken it yet, which is a state the
  // queue exists to represent rather than a missing value.
  @Column({ nullable: true, type: 'uuid' })
  assigneeUserWorkspaceId: string | null;

  @ManyToOne(() => UserWorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'assigneeUserWorkspaceId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID',
  })
  assigneeUserWorkspace: EntityRelation<UserWorkspaceEntity> | null;

  // The whole folding rule: two upserts naming the same slot are the same piece
  // of work, and no slot means one item per call.
  @Column({ nullable: true, type: 'varchar' })
  slotKey: string | null;

  // A caller that read the item at version N can only transition it while it is
  // still at N, so two people clearing the same approval with different
  // outcomes cannot both win.
  @Column({ nullable: false, type: 'integer', default: 1 })
  version: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
