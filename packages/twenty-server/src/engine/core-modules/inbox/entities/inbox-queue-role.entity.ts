import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CREATE_INBOX_CORE_TABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-30/create-inbox-core-tables-upgrade-command-name.constant';
import { InboxQueueEntity } from 'src/engine/core-modules/inbox/entities/inbox-queue.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

// Which roles can reach a shared inbox. Access is a permission, so it is
// granted the way every other permission is, rather than by a second list of
// people kept in step by hand. Who ends up doing a given piece of work is a
// separate question, answered by the item's assignee.
@Entity({ name: 'inboxQueueRole', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_INBOX_CORE_TABLES_UPGRADE_COMMAND_NAME,
})
@Index('IDX_INBOX_QUEUE_ROLE_QUEUE_ID_ROLE_ID_UNIQUE', ['queueId', 'roleId'], {
  unique: true,
})
@Index('IDX_INBOX_QUEUE_ROLE_ROLE_ID', ['roleId'])
export class InboxQueueRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'workspaceId',
    foreignKeyConstraintName: 'FK_INBOX_QUEUE_ROLE_WORKSPACE_ID',
  })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  queueId: string;

  @ManyToOne(() => InboxQueueEntity, (queue) => queue.roles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'queueId',
    foreignKeyConstraintName: 'FK_INBOX_QUEUE_ROLE_QUEUE_ID',
  })
  queue: EntityRelation<InboxQueueEntity>;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'roleId',
    foreignKeyConstraintName: 'FK_INBOX_QUEUE_ROLE_ROLE_ID',
  })
  role: EntityRelation<RoleEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
