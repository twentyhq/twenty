import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'recordExport', schema: 'core' })
@Index('IDX_RECORD_EXPORT_REQUESTER', [
  'workspaceId',
  'userWorkspaceId',
  'createdAt',
])
@Index('IDX_RECORD_EXPORT_EXPIRES_AT', ['expiresAt'])
@Index('IDX_RECORD_EXPORT_ACTIVE_WORKSPACE', ['workspaceId'], {
  unique: true,
  where: `"status" IN ('QUEUED', 'PROCESSING')`,
})
export class RecordExportEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userWorkspaceId: string;

  @Column({ type: 'uuid' })
  workspaceMemberId: string;

  @Column({ type: 'jsonb' })
  parameters: RecordExportParameters;

  @Column({ type: 'text' })
  filename: string;

  @Column({ type: 'text', default: RecordExportStatus.QUEUED })
  status: RecordExportStatus;

  @Column({ type: 'integer', default: 0 })
  processedRecordCount: number;

  @Column({ type: 'text', nullable: true })
  jobId: string | null;

  @Column({ type: 'uuid', nullable: true })
  attemptId: string | null;

  @Column({ type: 'text', nullable: true })
  filePath: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;
}
