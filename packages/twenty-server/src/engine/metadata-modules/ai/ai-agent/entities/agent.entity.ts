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

import { type Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AgentResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { type ModelConfiguration } from 'src/engine/metadata-modules/ai/ai-agent/types/modelConfiguration';
import {
  DEFAULT_SMART_MODEL,
  type ModelId,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';

@Entity('agent')
@Index('IDX_AGENT_ID_DELETED_AT', ['id', 'deletedAt'])
@Index('IDX_AGENT_NAME_WORKSPACE_ID_UNIQUE', ['name', 'workspaceId'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
export class AgentEntity
  extends SyncableEntity
  implements Required<AgentEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  standardId: string | null;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: false, type: 'text' })
  prompt: string;

  @Column({ nullable: false, type: 'varchar', default: DEFAULT_SMART_MODEL })
  modelId: ModelId;

  // Should not be nullable
  @Column({ nullable: true, type: 'jsonb', default: { type: 'text' } })
  responseFormat: AgentResponseFormat;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ default: false })
  isCustom: boolean;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.agents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @Column({ nullable: true, type: 'jsonb' })
  modelConfiguration: ModelConfiguration | null;

  @Column({ type: 'text', array: true, default: '{}' })
  evaluationInputs: string[];
}
