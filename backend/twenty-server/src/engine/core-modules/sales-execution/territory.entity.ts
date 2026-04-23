import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum SalesStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  NEEDS_ANALYSIS = 'needs_analysis',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export enum QuotaStatus {
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  BEHIND = 'behind',
  ACHIEVED = 'achieved',
}

@Entity('sales_territory')
@Index(['workspaceId', 'name'])
export class SalesTerritoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  regions: string[];

  @Column({ type: 'simple-array', nullable: true })
  industries: string[];

  @Column({ type: 'simple-json', nullable: true })
  assignees: string[];

  @Column({ type: 'int', default: 0 })
  quota: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('sales_quota')
@Index(['workspaceId', 'userId', 'period'])
export class SalesQuotaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  period: string;

  @Column({ type: 'int', nullable: false })
  targetAmount: number;

  @Column({ type: 'int', default: 0 })
  achievedAmount: number;

  @Column({ type: 'enum', enum: QuotaStatus, default: QuotaStatus.ON_TRACK })
  status: QuotaStatus;

  @CreateDateColumn()
  createdAt: Date;
}