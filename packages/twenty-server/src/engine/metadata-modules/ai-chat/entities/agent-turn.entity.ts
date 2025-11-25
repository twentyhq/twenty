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
import { AgentMessageEntity } from './agent-message.entity';

@Entity('agentTurn')
export class AgentTurnEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  threadId: string;

  @ManyToOne(() => AgentChatThreadEntity, (thread) => thread.turns, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'threadId' })
  thread: Relation<AgentChatThreadEntity>;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  agentId: string | null;

  @OneToMany(() => AgentMessageEntity, (message) => message.turn)
  messages: Relation<AgentMessageEntity[]>;

  @CreateDateColumn()
  createdAt: Date;
}

