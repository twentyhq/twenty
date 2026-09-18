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

import { ADD_AGENT_CHAT_CHANNELS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-agent-chat-channels-upgrade-command-name.constant';
import { ADD_AGENT_CHAT_THREAD_INBOX_STATE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-agent-chat-thread-inbox-state-upgrade-command-name.constant';
import { ADD_AGENT_CHAT_THREAD_READS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-agent-chat-thread-reads-upgrade-command-name.constant';
import { ADD_AGENT_CHAT_THREAD_WORKFLOW_RUN_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-agent-chat-thread-workflow-run-upgrade-command-name.constant';
import { ADD_LAST_STREAM_ERROR_TO_AGENT_CHAT_THREAD_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-19/add-last-stream-error-to-agent-chat-thread-upgrade-command-name.constant';
import { ADD_PENDING_QUESTION_MESSAGE_ID_TO_AGENT_CHAT_THREAD_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-19/add-pending-question-message-id-to-agent-chat-thread-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { nullableBigintColumnTransformer } from 'src/engine/core-modules/usage-limit/utils/nullable-bigint-column-transformer.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-channel.entity';
import { AgentChatThreadParticipantEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread-participant.entity';
import { AgentChatThreadReadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread-read.entity';
import { AgentChatThreadStatus } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-thread-status.enum';
import { type AgentChatThreadLastStreamError } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-last-stream-error.type';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

@Entity({ name: 'agentChatThread', schema: 'core' })
@Index('IDX_AGENT_CHAT_THREAD_ID_DELETED_AT', ['id', 'deletedAt'])
@Index('IDX_AGENT_CHAT_THREAD_STATUS', ['workspaceId', 'status'])
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

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_AGENT_CHAT_CHANNELS_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'uuid', nullable: true })
  @Index('IDX_AGENT_CHAT_THREAD_CHANNEL_ID')
  channelId: string | null;

  @ManyToOne(() => AgentChatChannelEntity, (channel) => channel.threads, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'channelId' })
  channel: EntityRelation<AgentChatChannelEntity> | null;

  // A thread opened by a workflow AI agent step is the run's conversation:
  // the run and step it belongs to live in the workspace schema, so they are
  // referenced without a foreign key.
  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_AGENT_CHAT_THREAD_WORKFLOW_RUN_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'uuid', nullable: true })
  @Index('IDX_AGENT_CHAT_THREAD_WORKFLOW_RUN_ID')
  workflowRunId: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_AGENT_CHAT_THREAD_WORKFLOW_RUN_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'varchar', nullable: true })
  workflowStepId: string | null;

  @Column({ type: 'int', default: 0 })
  totalInputTokens: number;

  @Column({ type: 'int', default: 0 })
  totalOutputTokens: number;

  @Column({ type: 'int', nullable: true })
  contextWindowTokens: number | null;

  @Column({ type: 'int', default: 0 })
  conversationSize: number;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: nullableBigintColumnTransformer,
  })
  totalInputCredits: number;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: nullableBigintColumnTransformer,
  })
  totalOutputCredits: number;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: nullableBigintColumnTransformer,
  })
  totalCacheReadTokens: number;

  @Column({
    type: 'bigint',
    default: 0,
    transformer: nullableBigintColumnTransformer,
  })
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

  // Status is a property of the thread, not of each reader: marking a thread
  // done takes it out of the list for everyone who shares it, the way a shared
  // inbox works. Who it lands on personally is carried by the assignee and by
  // the mentions on the participant rows.
  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_AGENT_CHAT_THREAD_INBOX_STATE_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'varchar', default: AgentChatThreadStatus.OPEN })
  status: AgentChatThreadStatus;

  // A snooze that has come due is read as open rather than rewritten, so a
  // thread returns on its own without a job having to sweep the table.
  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_AGENT_CHAT_THREAD_INBOX_STATE_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'timestamptz', nullable: true })
  snoozedUntil: Date | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_AGENT_CHAT_THREAD_INBOX_STATE_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'uuid', nullable: true })
  @Index('IDX_AGENT_CHAT_THREAD_ASSIGNEE_USER_WORKSPACE_ID')
  assigneeUserWorkspaceId: string | null;

  @ManyToOne(() => UserWorkspaceEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigneeUserWorkspaceId' })
  assigneeUserWorkspace: EntityRelation<UserWorkspaceEntity> | null;

  @OneToMany(
    () => AgentChatThreadParticipantEntity,
    (participant) => participant.thread,
  )
  participants: EntityRelation<AgentChatThreadParticipantEntity[]>;

  @OneToMany(() => AgentChatThreadReadEntity, (read) => read.thread)
  reads: EntityRelation<AgentChatThreadReadEntity[]>;

  // The assistant is one per thread, so its cursor is a column here rather
  // than a row in a table keyed by who in the workspace read.
  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_AGENT_CHAT_THREAD_READS_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'timestamptz', nullable: true })
  assistantLastReadAt: Date | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_AGENT_CHAT_THREAD_READS_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'uuid' })
  assistantLastReadMessageId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
