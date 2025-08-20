import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { AgentEntity } from './agent.entity';

@Entity('agentHandoff')
@Index('IDX_AGENT_HANDOFF_ID_DELETED_AT', ['id', 'deletedAt'])
@Index(
  'IDX_AGENT_HANDOFF_FROM_TO_WORKSPACE_UNIQUE',
  ['fromAgentId', 'toAgentId', 'workspaceId'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
export class AgentHandoffEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  fromAgentId: string;

  @Column({ nullable: false, type: 'uuid' })
  toAgentId: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @ManyToOne(() => AgentEntity, (agent) => agent.outgoingHandoffs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fromAgentId' })
  fromAgent: Relation<AgentEntity>;

  @ManyToOne(() => AgentEntity, (agent) => agent.incomingHandoffs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'toAgentId' })
  toAgent: Relation<AgentEntity>;

  @ManyToOne(() => Workspace, (workspace) => workspace.agentHandoffs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;
}
