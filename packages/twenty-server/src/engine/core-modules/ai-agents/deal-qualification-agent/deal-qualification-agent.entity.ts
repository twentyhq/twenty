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

export enum QualificationFramework {
  BANT = 'BANT',
  MEDDIC = 'MEDDIC',
  SPICED = 'SPICED',
  CUSTOM = 'CUSTOM',
}

export enum DealQualificationStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

@Entity('ai_agents_deal_qualification')
export class DealQualificationAgent {
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
  description: string;

  @Column({ type: 'enum', enum: DealQualificationStatus, default: DealQualificationStatus.PAUSED })
  status: DealQualificationStatus;

  @Column({ type: 'enum', enum: QualificationFramework, default: QualificationFramework.BANT })
  framework: QualificationFramework;

  @Column({ type: 'jsonb', nullable: true })
  customCriteria: Record<string, unknown>;

  @Column({ default: true })
  autoScoreEnabled: boolean;

  @Column({ default: true })
  questionsSuggestionsEnabled: boolean;

  @Column({ default: true })
  gapsDetectionEnabled: boolean;

  @Column({ type: 'int', default: 0 })
  dealsQualifiedCount: number;

  @Column({ type: 'int', default: 0 })
  dealsDisqualifiedCount: number;

  @Column({ type: 'int', default: 0 })
  questionsSuggestedCount: number;

  @Column({ nullable: true })
  lastRunAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('ai_deal_qualifications')
export class DealQualification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column({ nullable: true })
  dealId: string;

  @Column({ type: 'int', default: 0 })
  overallScore: number;

  @Column({ type: 'jsonb', nullable: true })
  criteriaScores: Record<string, unknown>;

  @Column({ nullable: true })
  qualificationLevel: string;

  @Column({ type: 'text', nullable: true })
  gapsIdentified: string;

  @Column({ type: 'jsonb', nullable: true })
  suggestedQuestions: string[];

  @Column({ type: 'text', nullable: true })
  recommendation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
