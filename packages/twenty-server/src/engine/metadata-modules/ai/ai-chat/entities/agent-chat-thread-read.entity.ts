import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { ADD_AGENT_CHAT_THREAD_READS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-agent-chat-thread-reads-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

// Reading is not participating: a channel member who opens a thread gets a
// cursor here rather than a participant row, so the people named on a thread
// stay the people who were put there.
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_AGENT_CHAT_THREAD_READS_UPGRADE_COMMAND_NAME,
})
@Entity({ name: 'agentChatThreadRead', schema: 'core' })
@Index(
  'IDX_AGENT_CHAT_THREAD_READ_THREAD_USER_WORKSPACE_UNIQUE',
  ['threadId', 'userWorkspaceId'],
  { unique: true },
)
export class AgentChatThreadReadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index('IDX_AGENT_CHAT_THREAD_READ_WORKSPACE_ID')
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  threadId: string;

  @ManyToOne(() => AgentChatThreadEntity, (thread) => thread.reads, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'threadId' })
  thread: Relation<AgentChatThreadEntity>;

  @Column({ nullable: false, type: 'uuid' })
  @Index('IDX_AGENT_CHAT_THREAD_READ_USER_WORKSPACE_ID')
  userWorkspaceId: string;

  @ManyToOne(() => UserWorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: EntityRelation<UserWorkspaceEntity>;

  @Column({ type: 'timestamptz' })
  lastReadAt: Date;

  // The message the cursor sits on, so a tick can be drawn against a message
  // rather than inferred from a time that may fall between two of them.
  @Column({ nullable: true, type: 'uuid' })
  lastReadMessageId: string | null;
}
