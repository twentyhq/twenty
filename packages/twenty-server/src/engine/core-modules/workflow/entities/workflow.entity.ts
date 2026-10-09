import { ADD_APPLICATION_WORKFLOW_SIDE_EFFECTS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-45/add-application-workflow-side-effects-upgrade-command-name.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { WorkflowVisibility } from 'twenty-shared/types';

import { ADD_IS_SYSTEM_TO_AGENT_AND_WORKFLOW_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-46/add-is-system-to-agent-and-workflow-upgrade-command-name.constant';
import { CREATE_WORKFLOW_CORE_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-20/create-workflow-core-table-upgrade-command-name.constant';
import { ADD_WORKSPACE_WORKFLOW_ID_TO_WORKFLOW_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-41/add-workspace-workflow-id-to-workflow-upgrade-command-name.constant';
import { ADD_CORE_VERSION_POINTERS_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-41/add-core-version-pointers-upgrade-command-name.constant';
import { ADD_WORKFLOW_VISIBILITY_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-workflow-visibility-upgrade-command-name.constant';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'workflow', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_WORKFLOW_CORE_TABLE_UPGRADE_COMMAND_NAME,
})
@Index('IDX_WORKFLOW_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_WORKFLOW_APPLICATION_ID', ['applicationId'])
@Index('IDX_WORKFLOW_VISIBILITY_CREATED_BY', [
  'workspaceId',
  'visibility',
  'createdByUserWorkspaceId',
])
export class WorkflowEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  name: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_APPLICATION_WORKFLOW_SIDE_EFFECTS_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'text', nullable: true })
  versionDefinitionHash: string | null;

  @Column({ type: 'uuid', nullable: true })
  lastPublishedVersionId: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_WORKSPACE_WORKFLOW_ID_TO_WORKFLOW_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'uuid', nullable: true })
  workspaceWorkflowId: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_CORE_VERSION_POINTERS_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'uuid', nullable: true })
  lastPublishedCoreWorkflowVersionId: string | null;

  // Enforced where ids resolve (CoreWorkflowIdResolutionService), so a private workflow's versions and steps are unreachable too.
  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_WORKFLOW_VISIBILITY_UPGRADE_COMMAND_NAME,
  })
  @Column({
    type: 'varchar',
    nullable: false,
    default: WorkflowVisibility.WORKSPACE,
  })
  visibility: WorkflowVisibility;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_IS_SYSTEM_TO_AGENT_AND_WORKFLOW_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'boolean', nullable: false, default: false })
  isSystem: boolean;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_WORKFLOW_VISIBILITY_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'uuid', nullable: true })
  createdByUserWorkspaceId: string | null;

  @ManyToOne(() => UserWorkspaceEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'createdByUserWorkspaceId',
    foreignKeyConstraintName: 'FK_WORKFLOW_CREATED_BY_USER_WORKSPACE',
  })
  createdBy: Relation<UserWorkspaceEntity> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
