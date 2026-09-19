import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CREATE_INBOX_TABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/create-inbox-tables-upgrade-command-name.constant';
import { InboxItemEntity } from 'src/engine/core-modules/inbox/entities/inbox-item.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

// What an item is about. Rows rather than a list inside the context blob, so
// the records are queryable and a deleted one can be found and cleaned up.
@Entity({ name: 'inboxItemRecord', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_INBOX_TABLES_UPGRADE_COMMAND_NAME,
})
@Index('IDX_INBOX_ITEM_RECORD_INBOX_ITEM_ID_POSITION', [
  'inboxItemId',
  'position',
])
@Index('IDX_INBOX_ITEM_RECORD_RECORD_ID', ['workspaceId', 'recordId'])
export class InboxItemRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'workspaceId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_RECORD_WORKSPACE_ID',
  })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  inboxItemId: string;

  @ManyToOne(() => InboxItemEntity, (inboxItem) => inboxItem.records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'inboxItemId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_RECORD_INBOX_ITEM_ID',
  })
  inboxItem: EntityRelation<InboxItemEntity>;

  // The pane draws these in a line and names the relation between neighbours,
  // so order is the structure and no separate edge list is needed.
  @Column({ nullable: false, type: 'integer' })
  position: number;

  // What the producer saw at the time. Only what a record cannot supply: for a
  // row that points at one, the live record is the better name.
  @Column({ nullable: false, type: 'varchar' })
  label: string;

  @Column({ nullable: true, type: 'varchar' })
  subtitle: string | null;

  // How this row relates to the one before it, which is the only edge the
  // surface ever draws.
  @Column({ nullable: true, type: 'varchar' })
  relationLabel: string | null;

  // Points into a workspace schema, so neither of these can be a foreign key.
  // Null on both means the producer named something the workspace has no
  // record for, which is a normal state rather than a missing value.
  @Column({ nullable: true, type: 'uuid' })
  objectMetadataId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  recordId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
