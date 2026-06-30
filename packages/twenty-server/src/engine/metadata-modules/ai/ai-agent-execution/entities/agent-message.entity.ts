import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum AgentMessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
}

export enum AgentMessageStatus {
  QUEUED = 'queued',
  SENT = 'sent',
}

@Entity({ name: 'agentMessage', schema: 'core' })
export class AgentMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  @Index()
  workspaceId: string;

  @ManyToOne('WorkspaceEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column('uuid')
  @Index()
  threadId: string;

  @ManyToOne(() => AgentChatThreadEntity, (thread) => thread.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'threadId' })
  thread: Relation<AgentChatThreadEntity>;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  turnId: string | null;

  @ManyToOne(() => AgentTurnEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'turnId' })
  turn: Relation<AgentTurnEntity> | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  agentId: string | null;

  @Column({ type: 'enum', enum: AgentMessageRole })
  role: AgentMessageRole;

  @Column({
    type: 'enum',
    enum: AgentMessageStatus,
    default: AgentMessageStatus.SENT,
  })
  status: AgentMessageStatus;

  @OneToMany(() => AgentMessagePartEntity, (part) => part.message)
  parts: Relation<AgentMessagePartEntity[]>;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
