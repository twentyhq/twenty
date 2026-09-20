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

  // PRIVATE currently covers the workflow itself: its list entries and its own
  // read and write endpoints. The version endpoints still resolve by id, so
  // this is as strong as an unlisted view, not yet a hard deny.
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
    upgradeCommandName: ADD_WORKFLOW_VISIBILITY_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'uuid', nullable: true })
  createdByUserWorkspaceId: string | null;

  @ManyToOne(() => UserWorkspaceEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'createdByUserWorkspaceId' })
  createdBy: Relation<UserWorkspaceEntity> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
