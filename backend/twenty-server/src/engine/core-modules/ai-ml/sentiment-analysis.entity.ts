import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum SentimentLabel {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
}

@Entity('sentiment_analysis')
@Index(['workspaceId', 'createdAt'])
export class SentimentAnalysisEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: true })
  recordId: string;

  @Column({ nullable: true })
  recordType: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({
    type: 'enum',
    enum: SentimentLabel,
    nullable: false,
  })
  sentiment: SentimentLabel;

  @Column({ type: 'float', nullable: false })
  confidence: number;

  @Column({ type: 'float', nullable: true })
  positiveScore: number;

  @Column({ type: 'float', nullable: true })
  negativeScore: number;

  @Column({ type: 'float', nullable: true })
  neutralScore: number;

  @Column({ type: 'simple-json', nullable: true })
  emotions: Record<string, number>;

  @Column({ type: 'simple-array', nullable: true })
  keyPhrases: string[];

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('sentiment_aggregate')
@Index(['workspaceId', 'period'])
export class SentimentAggregateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  period: string;

  @Column({ type: 'int', default: 0 })
  totalAnalyzed: number;

  @Column({ type: 'float', default: 0 })
  averageScore: number;

  @Column({ type: 'int', default: 0 })
  positiveCount: number;

  @Column({ type: 'int', default: 0 })
  negativeCount: number;

  @Column({ type: 'int', default: 0 })
  neutralCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  computedAt: Date;
}