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
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxItemStatus } from 'src/engine/core-modules/inbox/enums/inbox-item-status.enum';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// One thing asking for one person's attention. A conversation, a question from
// an agent, an approval, a failed run: same row, different type.
@Entity({ name: 'inboxItem', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_INBOX_CORE_TABLES_UPGRADE_COMMAND_NAME,
})
@Check(
  'CHK_INBOX_ITEM_SINGLE_ASSIGNEE',
  '("assigneeUserWorkspaceId" IS NOT NULL) != ("assigneeAgentId" IS NOT NULL)',
)
// One live item per slot and assignee. This is what makes folding race-free:
// concurrent producers collide here instead of duplicating.
@Index(
  'IDX_INBOX_ITEM_SLOT_KEY_OPEN_UNIQUE',
  ['workspaceId', 'assigneeUserWorkspaceId', 'slotKey'],
  {
    unique: true,
    where: `"status" = 'OPEN' AND "slotKey" IS NOT NULL AND "assigneeUserWorkspaceId" IS NOT NULL`,
  },
)
@Index('IDX_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID_STATUS', [
  'assigneeUserWorkspaceId',
  'status',
])
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
    enum: Object.values(InboxItemStatus),
    nullable: false,
    default: InboxItemStatus.OPEN,
  })
  status: InboxItemStatus;

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

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  snoozedUntil: Date | null;

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

  @Column({ nullable: true, type: 'uuid' })
  assigneeUserWorkspaceId: string | null;

  @ManyToOne(() => UserWorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'assigneeUserWorkspaceId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_ASSIGNEE_USER_WORKSPACE_ID',
  })
  assigneeUserWorkspace: EntityRelation<UserWorkspaceEntity> | null;

  @Column({ nullable: true, type: 'uuid' })
  assigneeAgentId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  slotKey: string | null;

  // Bumped by every transition. A caller that read the item at version N can
  // only transition it while it is still at N, so two people resolving the
  // same approval cannot both win.
  @Column({ nullable: false, type: 'integer', default: 1 })
  version: number;

  // Which of the type's declared outcomes ended this item, and whatever that
  // outcome declared it carries
  @Column({ nullable: true, type: 'varchar' })
  outcome: string | null;

  @Column({ nullable: true, type: 'jsonb' })
  result: JsonbProperty<InboxItemPayload> | null;

  @Column({ nullable: true, type: 'varchar' })
  cancellationReason: string | null;

  // A claim is a soft lease, not ownership: it says someone is working on this
  // right now, and it lapses on its own so nothing stays stuck
  @Column({ nullable: true, type: 'uuid' })
  claimedByUserWorkspaceId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  claimExpiresAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ nullable: true, type: 'uuid' })
  resolvedByUserWorkspaceId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
