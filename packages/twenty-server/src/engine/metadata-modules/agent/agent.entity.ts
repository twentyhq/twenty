import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { ModelId } from 'src/engine/core-modules/ai/constants/ai-models.const';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { AgentChatThreadEntity } from './agent-chat-thread.entity';

@Entity('agent')
@Index('IDX_AGENT_ID_DELETED_AT', ['id', 'deletedAt'])
@Unique('IDX_AGENT_NAME_WORKSPACE_ID_UNIQUE', ['name', 'workspaceId'])
export class AgentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false, type: 'text' })
  prompt: string;

  @Column({ nullable: false, type: 'varchar', default: 'auto' })
  modelId: ModelId;

  @Column({ nullable: true, type: 'jsonb' })
  responseFormat: object;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ default: false })
  isCustom: boolean;

  @ManyToOne(() => Workspace, (workspace) => workspace.agents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @OneToMany(() => AgentChatThreadEntity, (chatThread) => chatThread.agent)
  chatThreads: Relation<AgentChatThreadEntity[]>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;
}
