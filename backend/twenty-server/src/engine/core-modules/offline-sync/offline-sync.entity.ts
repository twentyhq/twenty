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

export enum SyncOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CONFLICT = 'conflict',
}

@Entity('offline_change')
export class OfflineChangeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  deviceId: string;

  @Column({ nullable: false })
  objectName: string;

  @Column({ nullable: false })
  objectId: string;

  @Column({
    type: 'enum',
    enum: SyncOperation,
    nullable: false,
  })
  operation: SyncOperation;

  @Column({ type: 'jsonb', nullable: false })
  data: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  previousData: Record<string, unknown>;

  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  status: SyncStatus;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  clientTimestamp: Date;

  @Column({ nullable: true })
  idempotencyKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('offline_conflict')
export class OfflineConflictEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: false })
  changeId: string;

  @ManyToOne(() => OfflineChangeEntity)
  @JoinColumn({ name: 'changeId' })
  change: OfflineChangeEntity;

  @Column({ nullable: false })
  serverData: Record<string, unknown>;

  @Column({ nullable: false })
  clientData: Record<string, unknown>;

  @Column({ nullable: true })
  resolution: 'client' | 'server' | 'merge';

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('offline_client')
export class OfflineClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: false })
  deviceId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: true })
  lastSyncToken: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastOfflineAt: Date;

  @Column({ type: 'int', default: 0 })
  pendingChanges: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
