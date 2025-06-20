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

import { AIModel } from 'src/engine/core-modules/ai/entities/ai-model.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity('agent')
@Index('IDX_AGENT_ID_DELETED_AT', ['id', 'deletedAt'])
export class AgentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false, type: 'text' })
  prompt: string;

  @Column({ nullable: false, type: 'varchar' })
  modelId: string;

  @ManyToOne(() => AIModel, (aiModel) => aiModel.modelId, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'modelId' })
  aiModel: Relation<AIModel>;

  @Column({ nullable: true, type: 'jsonb' })
  responseFormat: object;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.agents, {
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
