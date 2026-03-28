import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ImportJobStatus } from 'src/engine/core-modules/import-job/enums/import-job-status.enum';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'importJob', schema: 'core' })
@Index('IDX_IMPORT_JOB_WORKSPACE_STATUS', ['workspaceId', 'status'])
export class ImportJobEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  workspaceMemberId: string | null;

  @Column({ type: 'text' })
  objectNameSingular: string;

  @Column({ type: 'text', nullable: true })
  fileName: string | null;

  @Column({ type: 'jsonb', nullable: true })
  columnMappings: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  validatedRows: Record<string, unknown>[] | null;

  @Column({
    type: 'enum',
    enum: ImportJobStatus,
    default: ImportJobStatus.PENDING,
  })
  status: ImportJobStatus;

  @Column({ type: 'int', default: 0 })
  totalRecords: number;

  @Column({ type: 'int', default: 0 })
  processedRecords: number;

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  warningCount: number;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
