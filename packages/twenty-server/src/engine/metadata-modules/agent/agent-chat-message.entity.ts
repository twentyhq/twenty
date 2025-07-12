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

import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/agent/agent-chat-thread.entity';

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

  @Column('text')
  content: string;

  @OneToMany(() => FileEntity, (file) => file.message)
  files: Relation<FileEntity[]>;

  @CreateDateColumn()
  createdAt: Date;
}
