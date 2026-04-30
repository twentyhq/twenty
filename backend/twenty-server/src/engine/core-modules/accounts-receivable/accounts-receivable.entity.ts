import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  DISPUTED = 'disputed',
  VOIDED = 'voided',
  WRITTEN_OFF = 'written_off',
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export enum DisputeReason {
  WRONG_AMOUNT = 'wrong_amount',
  SERVICE_NOT_DELIVERED = 'service_not_delivered',
  DUPLICATE = 'duplicate',
  QUALITY_ISSUE = 'quality_issue',
  CONTRACT_DISPUTE = 'contract_dispute',
  OTHER = 'other',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  STRIPE = 'stripe',
  PAYU = 'payu',
  WOMPI = 'wompi',
  PSE = 'pse',
  ACH = 'ach',
  CASH = 'cash',
  CHECK = 'check',
}

export enum DunningTone {
  FRIENDLY = 'friendly',
  FIRM = 'firm',
  URGENT = 'urgent',
  FINAL = 'final',
}

@Entity('ar_invoice')
@Index(['workspaceId', 'status'])
@Index(['workspaceId', 'accountId'])
@Index(['workspaceId', 'dueDate'])
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  accountId: string;

  @Column({ nullable: true })
  dealId: string;

  @Column({ nullable: true })
  quoteId: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  invoiceNumber: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: false })
  subtotal: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: false })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  balanceDue: number;

  @Column({ type: 'varchar', length: 3, default: 'COP' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 })
  exchangeRate: number;

  @Column({ type: 'date', nullable: false })
  issueDate: Date;

  @Column({ type: 'date', nullable: false })
  dueDate: Date;

  @Column({ type: 'int', default: 30 })
  paymentTermsDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  lateFeeRate: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  lateFeeAmount: number;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recurringFrequency: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  viewedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  electronicInvoiceId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  electronicInvoiceProvider: string;

  @Column({ type: 'simple-json', nullable: true })
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; tax: number; total: number }>;

  @Column({ type: 'simple-array', nullable: true })
  attachmentIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('ar_payment')
@Index(['workspaceId', 'invoiceId'])
@Index(['workspaceId', 'receivedAt'])
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  invoiceId: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'COP' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalReference: string;

  @Column({ type: 'varchar', length: 20, default: 'applied' })
  matchStatus: string;

  @Column({ type: 'float', default: 1 })
  matchConfidence: number;

  @Column({ type: 'boolean', default: false })
  isDuplicate: boolean;

  @Column({ type: 'timestamp', nullable: false })
  receivedAt: Date;

  @Column({ type: 'boolean', default: false })
  syncedToERP: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('ar_dispute')
@Index(['workspaceId', 'invoiceId'])
export class DisputeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  invoiceId: string;

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.OPEN })
  status: DisputeStatus;

  @Column({ type: 'enum', enum: DisputeReason })
  reason: DisputeReason;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  disputedAmount: number;

  @Column({ nullable: true })
  assigneeId: string;

  @Column({ type: 'int', default: 72 })
  slaHours: number;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ type: 'simple-array', nullable: true })
  evidenceIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('ar_dunning_sequence')
@Index(['workspaceId'])
export class DunningSequenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'standard' })
  segment: string;

  @Column({ type: 'simple-json', nullable: false })
  steps: Array<{
    dayOffset: number;
    channel: string;
    tone: DunningTone;
    templateId?: string;
    subject?: string;
  }>;

  @Column({ type: 'boolean', default: true })
  pauseOnDispute: boolean;

  @Column({ type: 'boolean', default: true })
  pauseOnPromise: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('ar_payment_promise')
@Index(['workspaceId', 'invoiceId'])
export class PaymentPromiseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  invoiceId: string;

  @Column({ nullable: false })
  accountId: string;

  @Column({ type: 'date', nullable: false })
  promisedDate: Date;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: false })
  promisedAmount: number;

  @Column({ type: 'boolean', default: false })
  kept: boolean;

  @Column({ type: 'boolean', default: false })
  broken: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
