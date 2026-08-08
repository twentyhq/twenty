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
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

// Who watches a queue. This is also who may read its items, so it is the only
// thing standing between sales and the support mailbox.
@Entity({ name: 'inboxQueueMember', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_INBOX_CORE_TABLES_UPGRADE_COMMAND_NAME,
})
@Index(
  'IDX_INBOX_QUEUE_MEMBER_QUEUE_ID_USER_WORKSPACE_ID_UNIQUE',
  ['queueId', 'userWorkspaceId'],
  { unique: true },
)
@Index('IDX_INBOX_QUEUE_MEMBER_USER_WORKSPACE_ID', ['userWorkspaceId'])
export class InboxQueueMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'workspaceId',
    foreignKeyConstraintName: 'FK_INBOX_QUEUE_MEMBER_WORKSPACE_ID',
  })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  queueId: string;

  @ManyToOne(() => InboxQueueEntity, (queue) => queue.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'queueId',
    foreignKeyConstraintName: 'FK_INBOX_QUEUE_MEMBER_QUEUE_ID',
  })
  queue: EntityRelation<InboxQueueEntity>;

  @Column({ nullable: false, type: 'uuid' })
  userWorkspaceId: string;

  @ManyToOne(() => UserWorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userWorkspaceId',
    foreignKeyConstraintName: 'FK_INBOX_QUEUE_MEMBER_USER_WORKSPACE_ID',
  })
  userWorkspace: EntityRelation<UserWorkspaceEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
