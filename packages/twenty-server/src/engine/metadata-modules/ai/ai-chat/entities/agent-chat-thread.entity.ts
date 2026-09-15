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

import { ADD_LAST_STREAM_ERROR_TO_AGENT_CHAT_THREAD_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-19/add-last-stream-error-to-agent-chat-thread-upgrade-command-name.constant';
import { ADD_PENDING_QUESTION_MESSAGE_ID_TO_AGENT_CHAT_THREAD_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-19/add-pending-question-message-id-to-agent-chat-thread-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { type AgentChatThreadLastStreamError } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-last-stream-error.type';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

@Entity({ name: 'agentChatThread', schema: 'core' })
@Index('IDX_AGENT_CHAT_THREAD_ID_DELETED_AT', ['id', 'deletedAt'])
export class AgentChatThreadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index()
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: EntityRelation<WorkspaceEntity>;

  @Column({ nullable: false, type: 'uuid' })
  @Index()
  userWorkspaceId: string;

  @ManyToOne(() => UserWorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: EntityRelation<UserWorkspaceEntity>;

  @Column({ nullable: true, type: 'varchar' })
  title: string;

  @Column({ type: 'int', default: 0 })
  totalInputTokens: number;

  @Column({ type: 'int', default: 0 })
  totalOutputTokens: number;

  @Column({ type: 'int', nullable: true })
  contextWindowTokens: number | null;

  @Column({ type: 'int', default: 0 })
  conversationSize: number;

  @Column({ type: 'bigint', default: 0 })
  totalInputCredits: number;

  @Column({ type: 'bigint', default: 0 })
  totalOutputCredits: number;

  @Column({ type: 'bigint', default: 0 })
  totalCacheReadTokens: number;

  @Column({ type: 'bigint', default: 0 })
  totalCacheCreationTokens: number;

  @Column({ type: 'varchar', nullable: true })
  activeStreamId: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_PENDING_QUESTION_MESSAGE_ID_TO_AGENT_CHAT_THREAD_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'uuid', nullable: true })
  pendingQuestionMessageId: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_LAST_STREAM_ERROR_TO_AGENT_CHAT_THREAD_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'jsonb', nullable: true })
  lastStreamError: AgentChatThreadLastStreamError | null;

  @OneToMany(() => AgentTurnEntity, (turn) => turn.thread)
  turns: EntityRelation<AgentTurnEntity[]>;

  @OneToMany(() => AgentMessageEntity, (message) => message.thread)
  messages: EntityRelation<AgentMessageEntity[]>;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
