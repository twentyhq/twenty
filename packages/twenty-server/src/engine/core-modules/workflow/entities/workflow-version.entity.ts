import { ADD_APPLICATION_WORKFLOW_SIDE_EFFECTS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-45/add-application-workflow-side-effects-upgrade-command-name.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CREATE_WORKFLOW_VERSION_CORE_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-20/create-workflow-version-core-table-upgrade-command-name.constant';
import { ADD_CORE_WORKFLOW_ID_TO_WORKFLOW_VERSION_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-40/add-core-workflow-id-to-workflow-version-upgrade-command-name.constant';
import { ADD_WORKSPACE_WORKFLOW_VERSION_ID_TO_WORKFLOW_VERSION_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-workspace-workflow-version-id-to-workflow-version-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export enum WorkflowVersionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  ARCHIVED = 'ARCHIVED',
}

@Entity({ name: 'workflowVersion', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_WORKFLOW_VERSION_CORE_TABLE_UPGRADE_COMMAND_NAME,
})
@Index('IDX_WORKFLOW_VERSION_WORKSPACE_ID', ['workspaceId'])
@Index(
  'IDX_WORKFLOW_VERSION_ONE_ACTIVE_PER_WORKFLOW',
  ['workspaceId', 'coreWorkflowId'],
  {
    unique: true,
    where: `"status" = 'ACTIVE'`,
  },
)
@Index(
  'IDX_WORKFLOW_VERSION_WORKSPACE_VERSION_ID',
  ['workspaceId', 'workspaceWorkflowVersionId'],
  {
    unique: true,
    where: '"workspaceWorkflowVersionId" IS NOT NULL',
  },
)
@Index('IDX_WORKFLOW_VERSION_APPLICATION_ID', ['applicationId'])
export class WorkflowVersionEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_APPLICATION_WORKFLOW_SIDE_EFFECTS_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'boolean', default: false })
  isSystemSideEffect: boolean;

  @Column({ type: 'jsonb', nullable: true })
  triggers: WorkflowTrigger[] | null;

  @Column({ type: 'jsonb', nullable: true })
  steps: WorkflowAction[] | null;

  @Column({
    type: 'enum',
    enum: WorkflowVersionStatus,
    default: WorkflowVersionStatus.DRAFT,
    nullable: false,
  })
  status: WorkflowVersionStatus;

  @Column({ type: 'uuid', nullable: true })
  workflowId: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_CORE_WORKFLOW_ID_TO_WORKFLOW_VERSION_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'uuid', nullable: false })
  coreWorkflowId: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_WORKSPACE_WORKFLOW_VERSION_ID_TO_WORKFLOW_VERSION_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'uuid', nullable: true })
  workspaceWorkflowVersionId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
