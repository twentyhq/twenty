import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum HealthStatus {
  HEALTHY = 'healthy',
  AT_RISK = 'at_risk',
  CRITICAL = 'critical',
  CHURNED = 'churned',
}

@Entity('customer_health')
@Index(['workspaceId', 'accountId'])
export class CustomerHealthEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  accountId: string;

  @Column({ type: 'float', default: 100 })
  healthScore: number;

  @Column({ type: 'enum', enum: HealthStatus, default: HealthStatus.HEALTHY })
  status: HealthStatus;

  @Column({ type: 'simple-json', nullable: true })
  metrics: Record<string, number>;

  @Column({ type: 'simple-array', nullable: true })
  riskFactors: string[];

  @Column({ type: 'simple-json', nullable: true })
  recommendations: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  computedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('nps_survey')
@Index(['workspaceId', 'accountId'])
export class NPSSurveyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  accountId: string;

  @Column({ type: 'int', nullable: false })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'boolean', default: false })
  responded: boolean;

  @CreateDateColumn()
  createdAt: Date;
}