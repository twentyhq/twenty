import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { ADD_AGENT_CHAT_THREAD_INBOX_STATE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-agent-chat-thread-inbox-state-upgrade-command-name.constant';
import { ADD_AGENT_CHAT_THREAD_PARTICIPANTS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-agent-chat-thread-participants-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatThreadParticipantRole } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-thread-participant-role.enum';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_AGENT_CHAT_THREAD_PARTICIPANTS_UPGRADE_COMMAND_NAME,
})
@Entity({ name: 'agentChatThreadParticipant', schema: 'core' })
@Index(
  'IDX_AGENT_CHAT_THREAD_PARTICIPANT_THREAD_USER_WORKSPACE_UNIQUE',
  ['threadId', 'userWorkspaceId'],
  { unique: true },
)
export class AgentChatThreadParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index('IDX_AGENT_CHAT_THREAD_PARTICIPANT_WORKSPACE_ID')
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  @Index('IDX_AGENT_CHAT_THREAD_PARTICIPANT_THREAD_ID')
  threadId: string;

  @ManyToOne(() => AgentChatThreadEntity, (thread) => thread.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'threadId' })
  thread: Relation<AgentChatThreadEntity>;

  @Column({ nullable: false, type: 'uuid' })
  @Index('IDX_AGENT_CHAT_THREAD_PARTICIPANT_USER_WORKSPACE_ID')
  userWorkspaceId: string;

  @ManyToOne(() => UserWorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: EntityRelation<UserWorkspaceEntity>;

  @Column({
    type: 'varchar',
    default: AgentChatThreadParticipantRole.MEMBER,
  })
  role: AgentChatThreadParticipantRole;

  // A mention is what puts a shared thread on someone's own list, so the time
  // of the last one is kept rather than a flag: a later mention pulls a thread
  // back even after its reader has cleared it.
  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_AGENT_CHAT_THREAD_INBOX_STATE_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'timestamptz', nullable: true })
  lastMentionedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
