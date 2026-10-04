import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_IS_SYSTEM_TO_AGENT_AND_WORKFLOW_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-46/add-is-system-to-agent-and-workflow-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { AgentResponseFormat } from 'src/engine/metadata-modules/ai/ai-agent/types/agent-response-format.type';
import { ModelConfiguration } from 'src/engine/metadata-modules/ai/ai-agent/types/model-configuration.type';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

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

  @Column({
    nullable: false,
    type: 'varchar',
    default: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  })
  modelId: ModelId;

  // TODO: make non-nullable
  @Column({ nullable: true, type: 'jsonb', default: { type: 'text' } })
  responseFormat: JsonbProperty<AgentResponseFormat>;

  @Column({ default: false })
  isCustom: boolean;

  // Hides agents managed elsewhere (workflow steps, applications) from agent lists outside developer mode
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_IS_SYSTEM_TO_AGENT_AND_WORKFLOW_UPGRADE_COMMAND_NAME,
  })
  @Column({ default: false })
  isSystem: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @Column({ nullable: true, type: 'jsonb' })
  modelConfiguration: JsonbProperty<ModelConfiguration> | null;

  @Column({ type: 'text', array: true, default: '{}' })
  evaluationInputs: string[];
}
