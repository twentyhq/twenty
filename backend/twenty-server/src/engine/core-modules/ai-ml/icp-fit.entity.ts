import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum ICPScoreLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

@Entity('icp_fit')
@Index(['workspaceId', 'companyId'])
export class ICPFitEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  companyId: string;

  @Column({ type: 'float', nullable: false })
  overallScore: number;

  @Column({ type: 'enum', enum: ICPScoreLevel, nullable: false })
  level: ICPScoreLevel;

  @Column({ type: 'float', nullable: true })
  firmographicScore: number;

  @Column({ type: 'float', nullable: true })
  technographicScore: number;

  @Column({ type: 'float', nullable: true })
  behavioralScore: number;

  @Column({ type: 'simple-json', nullable: true })
  criteriaBreakdown: Record<string, { score: number; passed: boolean; weight: number }>;

  @Column({ type: 'simple-array', nullable: true })
  matchedCriteria: string[];

  @Column({ type: 'simple-array', nullable: true })
  failedCriteria: string[];

  @Column({ type: 'simple-json', nullable: true })
  recommendations: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  computedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('icp_criteria')
@Index(['workspaceId'])
export class ICPCriteriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  criteria: Record<string, unknown>;

  @Column({ type: 'float', default: 1.0 })
  weight: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @CreateDateColumn()
  createdAt: Date;
}