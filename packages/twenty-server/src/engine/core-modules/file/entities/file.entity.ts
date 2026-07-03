import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_STATUS_TO_FILE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-19/add-status-to-file-upgrade-command-name.constant';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileSettings } from 'src/engine/core-modules/file/types/file-settings.types';
import {
  FILE_STATUS,
  FileStatus,
} from 'src/engine/core-modules/file/types/file-status.types';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity('file')
@Index('IDX_FILE_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_FILE_STATUS', ['status'])
@Unique('IDX_APPLICATION_PATH_WORKSPACE_ID_APPLICATION_ID_UNIQUE', [
  'workspaceId',
  'applicationId',
  'path',
])
export class FileEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  applicationId: string;

  @ManyToOne('ApplicationEntity', {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity>;

  @Column({ nullable: false })
  path: string;

  @Column({ nullable: false, type: 'bigint' })
  size: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @Column({ nullable: false, default: false })
  isStaticAsset: boolean;

  @Column({ nullable: true, type: 'jsonb' })
  settings: FileSettings | null;

  @Column({
    nullable: false,
    type: 'varchar',
    default: 'application/octet-stream',
  })
  mimeType: string;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_STATUS_TO_FILE_UPGRADE_COMMAND_NAME,
  })
  @Column({
    type: 'enum',
    enum: Object.values(FILE_STATUS),
    nullable: false,
    default: FILE_STATUS.UPLOADED,
  })
  status: FileStatus;
}
