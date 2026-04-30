import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WorkspaceEntity } from '../../workspace/workspace.entity';

export enum ContractAgentStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

@Entity('ai_agents_contract_intelligence')
export class ContractIntelligenceAgent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ContractAgentStatus, default: ContractAgentStatus.PAUSED })
  status: ContractAgentStatus;

  @Column({ type: 'jsonb', nullable: true })
  extractionRules: Array<{
    field: string;
    pattern?: string;
    required: boolean;
  }>;

  @Column({ type: 'int', default: 0 })
  contractsProcessed: number;

  @Column({ type: 'int', default: 0 })
  renewalsDetected: number;

  @Column({ type: 'int', default: 0 })
  risksIdentified: number;

  @Column({ nullable: true })
  lastRunAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('contract_extraction')
export class ContractExtractionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  agentId: string;

  @Column({ nullable: false })
  contractFileId: string;

  @Column({ nullable: true })
  dealId: string;

  @Column({ nullable: true })
  accountId: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  renewalDate: Date;

  @Column({ type: 'boolean', nullable: true })
  autoRenew: boolean;

  @Column({ type: 'int', nullable: true })
  noticePeriodDays: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  totalValue: number;

  @Column({ type: 'jsonb', nullable: true })
  slas: Array<{ metric: string; target: string; penalty: string }>;

  @Column({ type: 'jsonb', nullable: true })
  penalties: Array<{ condition: string; amount: string }>;

  @Column({ type: 'jsonb', nullable: true })
  keyTerms: Record<string, string>;

  @Column({ type: 'simple-array', nullable: true })
  riskFlags: string[];

  @Column({ type: 'float', default: 0 })
  confidenceScore: number;

  @CreateDateColumn()
  createdAt: Date;
}
