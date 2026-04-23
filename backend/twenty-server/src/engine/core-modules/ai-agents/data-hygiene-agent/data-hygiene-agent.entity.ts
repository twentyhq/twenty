import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkspaceEntity } from '../../workspace/workspace.entity';

export enum DataHygieneStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

@Entity('ai_agents_data_hygiene')
export class DataHygieneAgent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: DataHygieneStatus, default: DataHygieneStatus.PAUSED })
  status: DataHygieneStatus;

  @Column({ default: true })
  duplicateDetectionEnabled: boolean;

  @Column({ default: true })
  autoEnrichmentEnabled: boolean;

  @Column({ default: true })
  dataNormalizationEnabled: boolean;

  @Column({ default: false })
  autoMergeEnabled: boolean;

  @Column({ nullable: true })
  mergeApprovalRequired: string | null;

  @Column({ type: 'jsonb', nullable: true })
  qualityRules: Record<string, unknown> | null;

  @Column({ type: 'int', default: 0 })
  duplicatesDetectedCount: number;

  @Column({ type: 'int', default: 0 })
  duplicatesMergedCount: number;

  @Column({ type: 'int', default: 0 })
  fieldsEnrichedCount: number;

  @Column({ type: 'int', default: 0 })
  recordsCleanedCount: number;

  @Column({ nullable: true })
  lastRunAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('ai_data_quality_issues')
export class DataQualityIssue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column()
  entityType: string;

  @Column()
  entityId: string;

  @Column()
  issueType: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  suggestedFix: Record<string, unknown> | null;

  @Column({ default: false })
  isResolved: boolean;

  @Column({ nullable: true })
  resolvedAt: Date | null;

  @Column({ nullable: true })
  resolvedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
