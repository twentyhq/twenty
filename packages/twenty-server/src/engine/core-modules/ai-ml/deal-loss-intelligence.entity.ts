import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum DealHealthStatus {
  HEALTHY = 'healthy',
  AT_RISK = 'at_risk',
  CRITICAL = 'critical',
  LOST = 'lost',
}

export enum LossReason {
  PRICE = 'price',
  COMPETITOR = 'competitor',
  TIMING = 'timing',
  NO_NEED = 'no_need',
  SUPPORT = 'support',
  PRODUCT_FIT = 'product_fit',
  UNKNOWN = 'unknown',
}

@Entity('deal_loss_intelligence')
@Index(['workspaceId', 'dealId'])
export class DealLossIntelligenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  dealId: string;

  @Column({ nullable: false })
  dealName: string;

  @Column({ type: 'float', nullable: true })
  lossProbability: number;

  @Column({ type: 'enum', enum: DealHealthStatus, default: DealHealthStatus.HEALTHY })
  healthStatus: DealHealthStatus;

  @Column({ type: 'simple-json', nullable: true })
  riskFactors: Record<string, number>;

  @Column({ type: 'simple-array', nullable: true })
  earlyWarningSigns: string[];

  @Column({ type: 'simple-json', nullable: true })
  recommendations: string[];

  @Column({ type: 'enum', enum: LossReason, nullable: true })
  predictedLossReason: LossReason;

  @Column({ type: 'float', nullable: true })
  expectedRevenue: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  computedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('deal_loss_analysis')
@Index(['workspaceId', 'dealId', 'analyzedAt'])
export class DealLossAnalysisEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  dealId: string;

  @Column({ type: 'text', nullable: true })
  activitySummary: string;

  @Column({ type: 'simple-json', nullable: true })
  engagementMetrics: Record<string, number>;

  @Column({ type: 'float', nullable: true })
  competitorMentionsScore: number;

  @Column({ type: 'float', nullable: true })
  priceSensitivityScore: number;

  @Column({ type: 'float', nullable: true })
  decisionTimelineScore: number;

  @Column({ type: 'float', nullable: true })
  stakeholderInvolvementScore: number;

  @Column({ type: 'boolean', default: false })
  isStalled: boolean;

  @Column({ type: 'int', default: 0 })
  daysSinceLastActivity: number;

  @Column({ type: 'timestamp', nullable: true })
  analyzedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
