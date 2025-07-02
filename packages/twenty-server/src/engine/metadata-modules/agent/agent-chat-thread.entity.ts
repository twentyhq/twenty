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

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { AgentChatMessagesEntity } from 'src/engine/metadata-modules/agent/agent-chat-message.entity';

import { AgentEntity } from './agent.entity';

@Entity('agentChatThread')
export class AgentChatThreadsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  agentId: string;

  @ManyToOne(() => AgentEntity, (agent) => agent.chatThreads, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'agentId' })
  agent: Relation<AgentEntity>;

  @OneToMany(() => AgentChatMessagesEntity, (message) => message.thread)
  messages: Relation<AgentChatMessagesEntity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
