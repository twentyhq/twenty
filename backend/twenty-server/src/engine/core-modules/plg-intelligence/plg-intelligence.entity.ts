import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UsageEventCategory { FEATURE = 'feature', SESSION = 'session', API = 'api', INTEGRATION = 'integration' }
export enum PQLGrade { HOT = 'hot', WARM = 'warm', COLD = 'cold', DISQUALIFIED = 'disqualified' }
export enum TrialStatus { ACTIVE = 'active', CONVERTED = 'converted', EXPIRED = 'expired', CANCELLED = 'cancelled' }
export enum AdoptionStage { ONBOARDING = 'onboarding', ACTIVATING = 'activating', ADOPTING = 'adopting', EXPANDING = 'expanding', CHURNING = 'churning' }

@Entity('product_usage_event')
@Index(['workspaceId', 'userId'])
@Index(['workspaceId', 'featureName'])
export class ProductUsageEventEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) userId: string;
  @Column({ type: 'varchar', length: 255, nullable: false }) featureName: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) action: string;
  @Column({ type: 'enum', enum: UsageEventCategory, default: UsageEventCategory.FEATURE }) category: UsageEventCategory;
  @Column({ type: 'simple-json', nullable: true }) metadata: Record<string, string | number>;
  @Column({ type: 'int', default: 1 }) count: number;
  @Column({ type: 'int', nullable: true }) durationMs: number;
  @Column({ type: 'varchar', length: 50, nullable: true }) sessionId: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('pql_score')
@Index(['workspaceId', 'grade'])
export class PQLScoreEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) accountId: string;
  @Column({ type: 'float', default: 0 }) score: number;
  @Column({ type: 'enum', enum: PQLGrade, default: PQLGrade.COLD }) grade: PQLGrade;
  @Column({ type: 'int', default: 0 }) activeUsers: number;
  @Column({ type: 'int', default: 0 }) featuresBreadth: number;
  @Column({ type: 'float', default: 0 }) usageFrequency: number;
  @Column({ type: 'float', default: 0 }) depthScore: number;
  @Column({ type: 'float', default: 0 }) growthRate: number;
  @Column({ type: 'simple-json', nullable: true }) topFeatures: string[];
  @Column({ type: 'simple-json', nullable: true }) signals: Record<string, number>;
  @Column({ type: 'timestamp', nullable: true }) lastCalculatedAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('trial_conversion')
@Index(['workspaceId', 'status'])
export class TrialConversionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) accountId: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) planName: string;
  @Column({ type: 'enum', enum: TrialStatus, default: TrialStatus.ACTIVE }) status: TrialStatus;
  @Column({ type: 'timestamp', nullable: false }) trialStartDate: Date;
  @Column({ type: 'timestamp', nullable: false }) trialEndDate: Date;
  @Column({ type: 'timestamp', nullable: true }) convertedAt: Date;
  @Column({ type: 'float', default: 0 }) conversionProbability: number;
  @Column({ type: 'int', default: 0 }) daysActive: number;
  @Column({ type: 'int', default: 0 }) featuresUsed: number;
  @Column({ type: 'int', default: 0 }) seatsUsed: number;
  @Column({ type: 'simple-json', nullable: true }) conversionSignals: Record<string, number>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('product_adoption')
@Index(['workspaceId', 'accountId'])
export class ProductAdoptionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) accountId: string;
  @Column({ type: 'enum', enum: AdoptionStage, default: AdoptionStage.ONBOARDING }) stage: AdoptionStage;
  @Column({ type: 'float', default: 0 }) adoptionScore: number;
  @Column({ type: 'int', default: 0 }) totalUsers: number;
  @Column({ type: 'int', default: 0 }) activeUsers: number;
  @Column({ type: 'float', default: 0 }) dauWauRatio: number;
  @Column({ type: 'simple-json', nullable: true }) featureAdoption: Record<string, number>;
  @Column({ type: 'simple-json', nullable: true }) milestones: Record<string, boolean>;
  @Column({ type: 'int', default: 0 }) daysSinceFirstUse: number;
  @Column({ type: 'float', default: 0 }) timeToValue: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
