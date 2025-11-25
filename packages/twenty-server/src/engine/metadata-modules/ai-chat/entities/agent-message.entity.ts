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
import { AgentTurnEntity } from 'src/engine/metadata-modules/ai-chat/entities/agent-turn.entity';
import { AgentMessagePartEntity } from './agent-message-part.entity';

export enum AgentMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

@Entity('agentMessage')
export class AgentMessageEntity {
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

  @Column('uuid')
  @Index()
  turnId: string;

  @ManyToOne(() => AgentTurnEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'turnId' })
  turn: Relation<AgentTurnEntity>;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  agentId: string | null;

  @Column({ type: 'enum', enum: AgentMessageRole })
  role: AgentMessageRole;

  @OneToMany(() => AgentMessagePartEntity, (part) => part.message)
  parts: Relation<AgentMessagePartEntity[]>;

  @CreateDateColumn()
  createdAt: Date;
}

