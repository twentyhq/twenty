import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { type WorkflowStepWait } from 'twenty-shared/workflow';

import { CREATE_WORKFLOW_STEP_WAIT_TABLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-46/create-workflow-step-wait-table-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

// Waits a step resolves on its own, time or event, so they survive a lost queue job or a restart.
// Deleting the row is how a resolution claims the step, so a wait resolves once.
@Entity({ name: 'workflowStepWait', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: CREATE_WORKFLOW_STEP_WAIT_TABLE_UPGRADE_COMMAND_NAME,
})
@Unique('UQ_WORKFLOW_STEP_WAIT_RUN_STEP', ['workflowRunId', 'stepId'])
@Index('IDX_WORKFLOW_STEP_WAIT_WORKSPACE_EVENT_NAME', [
  'workspaceId',
  'eventName',
])
@Index('IDX_WORKFLOW_STEP_WAIT_RESUME_AT', ['resumeAt'])
export class WorkflowStepWaitEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workflowRunId: string;

  @Column({ type: 'varchar' })
  stepId: string;

  @Column({ type: 'jsonb' })
  wait: Exclude<WorkflowStepWait, { type: 'ANSWER' }>;

  @Column({ type: 'varchar', nullable: true })
  eventName: string | null;

  // When a time wait elapses or an event wait expires
  @Column({ type: 'timestamptz', nullable: true })
  resumeAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
