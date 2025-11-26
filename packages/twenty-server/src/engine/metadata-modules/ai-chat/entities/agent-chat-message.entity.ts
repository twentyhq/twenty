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

import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai-chat/entities/agent-chat-thread.entity';

import { AgentChatMessagePartEntity } from './agent-chat-message-part.entity';

export enum AgentChatMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

@Entity('agentChatMessage')
export class AgentChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  threadId: string;

  @ManyToOne(() => AgentChatThreadEntity, (thread) => thread.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'threadId' })
  thread: Relation<AgentChatThreadEntity>;

  @Column({ type: 'enum', enum: AgentChatMessageRole })
  role: AgentChatMessageRole;

  @OneToMany(() => AgentChatMessagePartEntity, (part) => part.message)
  parts: Relation<AgentChatMessagePartEntity[]>;

  @CreateDateColumn()
  createdAt: Date;
}
