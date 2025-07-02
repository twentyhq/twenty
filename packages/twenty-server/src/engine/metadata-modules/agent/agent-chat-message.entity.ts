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

@Entity('agent_chat_messages')
export class AgentChatMessagesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  threadId: string;

  @ManyToOne(() => AgentChatThreadsEntity, (thread) => thread.messages)
  @JoinColumn({ name: 'threadId' })
  thread: Relation<AgentChatThreadsEntity>;

  @Column({ type: 'varchar', length: 8 })
  sender: 'user' | 'ai';

  @Column('text')
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
