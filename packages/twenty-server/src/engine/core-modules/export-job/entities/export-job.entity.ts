import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ExportJobStatus } from 'src/engine/core-modules/export-job/enums/export-job-status.enum';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'exportJob', schema: 'core' })
@Index('IDX_EXPORT_JOB_WORKSPACE_STATUS', ['workspaceId', 'status'])
export class ExportJobEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  workspaceMemberId: string | null;

  @Column({ type: 'text' })
  objectNameSingular: string;

  @Column({ type: 'jsonb', nullable: true })
  filter: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  orderBy: Record<string, unknown> | null;

  @Column({ type: 'jsonb' })
  columns: Record<string, unknown>[];

  @Column({ type: 'jsonb', nullable: true })
  relationConfigs: Record<string, unknown>[] | null;

  @Column({ type: 'text', default: 'csv' })
  format: string;

  @Column({
    type: 'enum',
    enum: ExportJobStatus,
    default: ExportJobStatus.PENDING,
  })
  status: ExportJobStatus;

  @Column({ type: 'int', default: 0 })
  totalRecords: number;

  @Column({ type: 'int', default: 0 })
  processedRecords: number;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
