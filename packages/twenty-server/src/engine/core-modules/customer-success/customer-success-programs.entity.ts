import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum CustomerSuccessPlaybookStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export interface CustomerSuccessPlaybookStep {
  title: string;
  description?: string;
  completed?: boolean;
  dueInDays?: number;
}

@Entity('customer_success_playbook')
@Index(['workspaceId', 'accountId'])
export class CustomerSuccessPlaybookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: true })
  accountId: string | null;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'simple-json', nullable: true })
  steps: CustomerSuccessPlaybookStep[];

  @Column({ type: 'simple-array', nullable: true })
  triggers: string[];

  @Column({ type: 'text', nullable: true })
  assigneeId: string | null;

  @Column({ type: 'enum', enum: CustomerSuccessPlaybookStatus, default: CustomerSuccessPlaybookStatus.DRAFT })
  status: CustomerSuccessPlaybookStatus;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @CreateDateColumn()
  createdAt: Date;
}

export enum QBRStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('qbr_record')
@Index(['workspaceId', 'accountId'])
export class QBRRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  accountId: string;

  @Column({ type: 'timestamp', nullable: false })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'simple-json', nullable: true })
  actionItems: string[];

  @Column({ type: 'simple-array', nullable: true })
  attendees: string[];

  @Column({ type: 'enum', enum: QBRStatus, default: QBRStatus.SCHEDULED })
  status: QBRStatus;

  @CreateDateColumn()
  createdAt: Date;
}

export enum ExpansionRevenueType {
  UPSELL = 'upsell',
  CROSS_SELL = 'cross_sell',
  RENEWAL = 'renewal',
}

export enum ExpansionRevenueStatus {
  FORECASTED = 'forecasted',
  COMMITTED = 'committed',
  REALIZED = 'realized',
}

@Entity('expansion_revenue')
@Index(['workspaceId', 'accountId'])
export class ExpansionRevenueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  accountId: string;

  @Column({ nullable: true })
  dealId: string | null;

  @Column({ type: 'enum', enum: ExpansionRevenueType })
  type: ExpansionRevenueType;

  @Column({ type: 'float', default: 0 })
  amount: number;

  @Column({ type: 'enum', enum: ExpansionRevenueStatus, default: ExpansionRevenueStatus.FORECASTED })
  status: ExpansionRevenueStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recognizedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
