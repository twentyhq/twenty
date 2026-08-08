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

import { CREATE_INBOX_CORE_TABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-30/create-inbox-core-tables-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { type InboxItemAction } from 'src/engine/core-modules/inbox/types/inbox-item-action.type';
import { type InboxItemResolution } from 'src/engine/core-modules/inbox/types/inbox-item-resolution.type';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

// Declares one kind of work that can land in an inbox: how it renders, and
// which actions it offers. Syncable so that the built-in types and app-declared
// types share one shape and one identity space.
@Entity({ name: 'inboxItemType', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_INBOX_CORE_TABLES_UPGRADE_COMMAND_NAME,
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

  @Column({ nullable: false, type: 'jsonb', default: [] })
  actions: JsonbProperty<InboxItemAction[]>;

  // The ways an item of this type can end. An approval declares APPROVED and
  // REJECTED, a question declares ANSWERED with an answer field: the engine
  // stores the outcome key and its result without knowing either word.
  @Column({ nullable: true, type: 'jsonb' })
  resolution: JsonbProperty<InboxItemResolution> | null;

  // Optional app front component rendered in place of the generic detail card
  @Column({ nullable: true, type: 'uuid' })
  detailFrontComponentId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
