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

import { AgentChatThreadsEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';

export enum AgentChatMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

@Entity('agentChatMessage')
export class AgentChatMessagesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  threadId: string;

  @ManyToOne(() => AgentChatThreadsEntity, (thread) => thread.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'threadId' })
  thread: Relation<AgentChatThreadsEntity>;

  @Column({ type: 'enum', enum: AgentChatMessageRole })
  role: AgentChatMessageRole;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
