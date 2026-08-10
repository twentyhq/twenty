import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CREATE_INBOX_CORE_TABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-30/create-inbox-core-tables-upgrade-command-name.constant';
import { InboxQueueRoleEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue-role.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

// An inbox several people share. Work addressed here is nobody's until someone
// takes it, which is the whole difference from a personal inbox.
@Entity({ name: 'inboxQueue', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_INBOX_CORE_TABLES_UPGRADE_COMMAND_NAME,
})
@Index('IDX_INBOX_QUEUE_WORKSPACE_ID_SLUG_UNIQUE', ['workspaceId', 'slug'], {
  unique: true,
})
// Exactly one queue catches work that no rule could address. Without it a
// producer with nobody to route to has nowhere to put its item.
@Index('IDX_INBOX_QUEUE_WORKSPACE_ID_DEFAULT_UNIQUE', ['workspaceId'], {
  unique: true,
  where: `"isDefault"`,
})
export class InboxQueueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'workspaceId',
    foreignKeyConstraintName: 'FK_INBOX_QUEUE_WORKSPACE_ID',
  })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'varchar' })
  slug: string;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ nullable: false, type: 'boolean', default: false })
  isDefault: boolean;

  @OneToMany(() => InboxQueueRoleEntity, (queueRole) => queueRole.queue)
  roles: EntityRelation<InboxQueueRoleEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
