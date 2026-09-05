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

import { CREATE_INBOX_TABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-39/create-inbox-tables-upgrade-command-name.constant';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

// Every kind of work offers the same controls, so the type says nothing about
// what an item can do. Syncable so that built-in and app-declared types share
// one shape and one identity space.
@Entity({ name: 'inboxItemType', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_INBOX_TABLES_UPGRADE_COMMAND_NAME,
})
@Index('IDX_INBOX_ITEM_TYPE_KEY_WORKSPACE_ID_UNIQUE', ['key', 'workspaceId'], {
  unique: true,
})
@Index('IDX_INBOX_ITEM_TYPE_APPLICATION_ID', ['applicationId'])
@Index(
  'IDX_INBOX_ITEM_TYPE_WORKSPACE_ID_UNIVERSAL_IDENTIFIER_UNIQUE',
  ['workspaceId', 'universalIdentifier'],
  { unique: true },
)
export class InboxItemTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The SyncableEntity shape is spelled out rather than inherited so the
  // foreign-key names are deterministic and match the create-table command.
  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'workspaceId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_TYPE_WORKSPACE_ID',
  })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  universalIdentifier: string;

  @Column({ nullable: false, type: 'uuid' })
  applicationId: string;

  @ManyToOne(() => ApplicationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'applicationId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_TYPE_APPLICATION_ID',
  })
  application: EntityRelation<ApplicationEntity>;

  @Column({ nullable: false, type: 'varchar' })
  key: string;

  @Column({ nullable: false, type: 'varchar' })
  label: string;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({
    type: 'enum',
    enum: Object.values(InboxItemPriority),
    nullable: false,
    default: InboxItemPriority.UPDATE,
  })
  defaultPriority: InboxItemPriority;

  // Configured rather than coded, so sending failed runs to an Ops inbox is a
  // setting rather than a release.
  @Column({ nullable: true, type: 'uuid' })
  defaultQueueId: string | null;

  @ManyToOne(() => InboxQueueEntity, { onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'defaultQueueId',
    foreignKeyConstraintName: 'FK_INBOX_ITEM_TYPE_DEFAULT_QUEUE_ID',
  })
  defaultQueue: EntityRelation<InboxQueueEntity> | null;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
