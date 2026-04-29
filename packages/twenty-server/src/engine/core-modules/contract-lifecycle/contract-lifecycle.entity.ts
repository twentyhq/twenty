import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ContractStatus { DRAFT = 'draft', IN_REVIEW = 'in_review', NEGOTIATION = 'negotiation', PENDING_SIGNATURE = 'pending_signature', ACTIVE = 'active', EXPIRED = 'expired', TERMINATED = 'terminated' }
export enum ApprovalStatus { PENDING = 'pending', APPROVED = 'approved', REJECTED = 'rejected' }

@Entity('clm_contract')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'accountId'])
export class CLMContractEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: true }) dealId: string;
  @Column({ nullable: true }) accountId: string;
  @Column({ nullable: false }) title: string;
  @Column({ type: 'varchar', length: 50, default: 'service' }) contractType: string;
  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.DRAFT }) status: ContractStatus;
  @Column({ type: 'varchar', length: 50, nullable: true }) templateId: string;
  @Column({ type: 'text', nullable: true }) content: string;
  @Column({ type: 'int', default: 1 }) version: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) totalValue: number;
  @Column({ type: 'date', nullable: true }) startDate: Date;
  @Column({ type: 'date', nullable: true }) endDate: Date;
  @Column({ type: 'boolean', default: false }) autoRenew: boolean;
  @Column({ type: 'int', default: 30 }) noticePeriodDays: number;
  @Column({ type: 'simple-json', nullable: true }) obligations: Array<{ clause: string; responsible: string; dueDate: string; completed: boolean }>;
  @Column({ type: 'simple-json', nullable: true }) slas: Array<{ metric: string; target: string; penalty: string }>;
  @Column({ type: 'float', nullable: true }) riskScore: number;
  @Column({ type: 'simple-array', nullable: true }) riskFlags: string[];
  @Column({ type: 'simple-json', nullable: true }) signatureAudit: Array<{ signerId: string; ip: string; timestamp: string; hash: string }>;
  @Column({ type: 'simple-json', nullable: true }) approvalChain: Array<{ role: string; userId: string; status: ApprovalStatus; date?: string }>;
  @Column({ type: 'simple-json', nullable: true }) redlineHistory: Array<{ userId: string; change: string; timestamp: string }>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('clm_template')
@Index(['workspaceId'])
export class CLMTemplateEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'varchar', length: 50, default: 'service' }) type: string;
  @Column({ type: 'text', nullable: false }) content: string;
  @Column({ type: 'simple-json', nullable: true }) lockedClauses: string[];
  @Column({ type: 'simple-json', nullable: true }) variables: string[];
  @CreateDateColumn() createdAt: Date;
}
