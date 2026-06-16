import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export enum WorkflowVersionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  ARCHIVED = 'ARCHIVED',
}

@Entity({ name: 'workflowVersion', schema: 'core' })
@Index('IDX_WORKFLOW_VERSION_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_WORKFLOW_VERSION_WORKFLOW_ID_DELETED_AT', [
  'workflowId',
  'deletedAt',
])
export class WorkflowVersionEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'jsonb', nullable: true })
  trigger: WorkflowTrigger | null;

  @Column({ type: 'jsonb', nullable: true })
  steps: WorkflowAction[] | null;

  @Column({
    type: 'enum',
    enum: WorkflowVersionStatus,
    default: WorkflowVersionStatus.DRAFT,
    nullable: false,
  })
  status: WorkflowVersionStatus;

  @Column({ type: 'double precision', nullable: false, default: 0 })
  position: number;

  @Column({ type: 'uuid', nullable: false })
  workflowId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
