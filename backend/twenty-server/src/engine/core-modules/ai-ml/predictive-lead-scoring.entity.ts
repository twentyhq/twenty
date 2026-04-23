import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum LeadScoreStatus {
  DRAFT = 'draft',
  TRAINING = 'training',
  ACTIVE = 'active',
  FAILED = 'failed',
}

export enum LeadScoreModelType {
  LINEAR_REGRESSION = 'linear_regression',
  RANDOM_FOREST = 'random_forest',
  XGBOOST = 'xgboost',
  NEURAL_NETWORK = 'neural_network',
}

@Entity('predictive_lead_scoring')
@Index(['workspaceId', 'status'])
export class PredictiveLeadScoringEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: LeadScoreStatus,
    default: LeadScoreStatus.DRAFT,
  })
  status: LeadScoreStatus;

  @Column({
    type: 'enum',
    enum: LeadScoreModelType,
    default: LeadScoreModelType.XGBOOST,
  })
  modelType: LeadScoreModelType;

  @Column({ type: 'float', default: 0.7 })
  confidenceThreshold: number;

  @Column({ type: 'simple-array', nullable: true })
  features: string[];

  @Column({ type: 'simple-json', nullable: true })
  modelConfig: Record<string, unknown>;

  @Column({ type: 'float', nullable: true })
  accuracy: number;

  @Column({ type: 'float', nullable: true })
  precision: number;

  @Column({ type: 'float', nullable: true })
  recall: number;

  @Column({ type: 'float', nullable: true })
  f1Score: number;

  @Column({ type: 'int', default: 0 })
  trainingDataSize: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTrainedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextScheduledTraining: Date;

  @Column({ type: 'boolean', default: true })
  autoRetrain: boolean;

  @Column({ type: 'int', default: 30 })
  retrainIntervalDays: number;

  @Column({ type: 'simple-json', nullable: true })
  featureImportance: Record<string, number>;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('lead_score_prediction')
@Index(['workspaceId', 'leadId'])
@Index(['workspaceId', 'predictedAt'])
export class LeadScorePredictionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  leadId: string;

  @Column({ type: 'float', nullable: false })
  score: number;

  @Column({ type: 'float', nullable: true })
  probability: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tier: string;

  @Column({ type: 'simple-json', nullable: true })
  factorBreakdown: Record<string, number>;

  @Column({ type: 'simple-json', nullable: true })
  recommendations: string[];

  @Column({ nullable: true })
  modelId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  predictedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  convertedAt: Date;

  @Column({ type: 'boolean', default: false })
  actualConverted: boolean;
}
