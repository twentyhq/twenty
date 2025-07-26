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

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AgentChatMessageEntity } from 'src/engine/metadata-modules/agent/agent-chat-message.entity';

import { AgentEntity } from './agent.entity';

@Entity('agentChatThread')
export class AgentChatThreadEntity {
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

  @Column('uuid')
  @Index()
  userWorkspaceId: string;

  @ManyToOne(() => UserWorkspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userWorkspaceId' })
  userWorkspace: Relation<UserWorkspace>;

  @Column({ nullable: true, type: 'varchar' })
  title: string;

  @OneToMany(() => AgentChatMessageEntity, (message) => message.thread)
  messages: Relation<AgentChatMessageEntity[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
