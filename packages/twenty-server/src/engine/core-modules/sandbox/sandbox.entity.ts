import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export enum SandboxStatus {
  CREATING = 'creating',
  ACTIVE = 'active',
  PAUSED = 'paused',
  FAILED = 'failed',
}

export enum SandboxSource {
  PRODUCTION = 'production',
  TEMPLATE = 'template',
}

@Entity('sandbox')
export class SandboxEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SandboxStatus,
    default: SandboxStatus.CREATING,
  })
  status: SandboxStatus;

  @Column({
    type: 'enum',
    enum: SandboxSource,
    default: SandboxSource.PRODUCTION,
  })
  source: SandboxSource;

  @Column({ nullable: true })
  sourceWorkspaceId: string;

  @Column({ nullable: true })
  sourceTemplateId: string;

  @Column({ type: 'varchar', nullable: true })
  databaseSchema: string;

  @Column({ type: 'boolean', default: false })
  includeData: boolean;

  @Column({ type: 'int', default: 10 })
  dataSamplePercent: number;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRefreshedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  @Column({ type: 'boolean', default: false })
  autoRefresh: boolean;

  @Column({ type: 'int', default: 24 })
  autoRefreshIntervalHours: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
