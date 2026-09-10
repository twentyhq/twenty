import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CREATE_WORKFLOW_CORE_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-20/create-workflow-core-table-upgrade-command-name.constant';
import { ADD_WORKSPACE_WORKFLOW_ID_TO_WORKFLOW_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-40/add-workspace-workflow-id-to-workflow-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'workflow', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_WORKFLOW_CORE_TABLE_UPGRADE_COMMAND_NAME,
})
@Index('IDX_WORKFLOW_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_WORKFLOW_APPLICATION_ID', ['applicationId'])
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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
