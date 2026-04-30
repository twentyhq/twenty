import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum BankConnectionStatus { ACTIVE = 'active', INACTIVE = 'inactive', ERROR = 'error', PENDING_AUTH = 'pending_auth' }
export enum TransactionType { CREDIT = 'credit', DEBIT = 'debit', TRANSFER = 'transfer', FEE = 'fee' }
export enum ReconciliationStatus { PENDING = 'pending', MATCHED = 'matched', PARTIAL = 'partial', UNMATCHED = 'unmatched', MANUAL = 'manual' }
export enum PaymentNetwork { PSE = 'pse', SPEI = 'spei', ACH = 'ach', SWIFT = 'swift', WIRE = 'wire', LOCAL = 'local' }
export enum PaymentFileFormat { BAI2 = 'bai2', MT940 = 'mt940', CSV = 'csv', PAIN001 = 'pain001', CUSTOM = 'custom' }

@Entity('bank_connection')
@Index(['workspaceId'])
export class BankConnectionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) bankName: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) bankCode: string;
  @Column({ type: 'varchar', length: 50, nullable: false }) accountNumber: string;
  @Column({ type: 'varchar', length: 10, nullable: true }) accountType: string;
  @Column({ type: 'varchar', length: 3, default: 'COP' }) currency: string;
  @Column({ type: 'varchar', length: 2, default: 'CO' }) country: string;
  @Column({ type: 'enum', enum: BankConnectionStatus, default: BankConnectionStatus.PENDING_AUTH }) status: BankConnectionStatus;
  @Column({ type: 'enum', enum: PaymentNetwork, default: PaymentNetwork.LOCAL }) network: PaymentNetwork;
  @Column({ type: 'text', nullable: true }) encryptedCredentials: string;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) currentBalance: number;
  @Column({ type: 'timestamp', nullable: true }) lastSyncAt: Date;
  @Column({ type: 'boolean', default: true }) autoSync: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('bank_transaction')
@Index(['workspaceId', 'connectionId'])
@Index(['workspaceId', 'reconciliationStatus'])
export class BankTransactionEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) connectionId: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) externalId: string;
  @Column({ type: 'enum', enum: TransactionType, default: TransactionType.DEBIT }) type: TransactionType;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false }) amount: number;
  @Column({ type: 'varchar', length: 3, default: 'COP' }) currency: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) counterpartyName: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) counterpartyAccount: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) reference: string;
  @Column({ type: 'timestamp', nullable: false }) transactionDate: Date;
  @Column({ type: 'timestamp', nullable: true }) valueDate: Date;
  @Column({ type: 'enum', enum: ReconciliationStatus, default: ReconciliationStatus.PENDING }) reconciliationStatus: ReconciliationStatus;
  @Column({ nullable: true }) matchedInvoiceId: string;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) runningBalance: number;
  @CreateDateColumn() createdAt: Date;
}

@Entity('bank_reconciliation')
@Index(['workspaceId'])
export class BankReconciliationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) connectionId: string;
  @Column({ type: 'date', nullable: false }) periodStart: Date;
  @Column({ type: 'date', nullable: false }) periodEnd: Date;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) openingBalance: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) closingBalance: number;
  @Column({ type: 'int', default: 0 }) totalTransactions: number;
  @Column({ type: 'int', default: 0 }) matchedTransactions: number;
  @Column({ type: 'int', default: 0 }) unmatchedTransactions: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) discrepancyAmount: number;
  @Column({ type: 'varchar', length: 20, default: 'draft' }) status: string;
  @Column({ nullable: true }) approvedBy: string;
  @Column({ type: 'timestamp', nullable: true }) approvedAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('payment_file')
@Index(['workspaceId'])
export class PaymentFileEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) connectionId: string;
  @Column({ type: 'enum', enum: PaymentFileFormat, default: PaymentFileFormat.CSV }) format: PaymentFileFormat;
  @Column({ type: 'enum', enum: PaymentNetwork, default: PaymentNetwork.LOCAL }) network: PaymentNetwork;
  @Column({ type: 'varchar', length: 255, nullable: false }) fileName: string;
  @Column({ type: 'int', default: 0 }) recordCount: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) totalAmount: number;
  @Column({ type: 'varchar', length: 3, default: 'COP' }) currency: string;
  @Column({ type: 'text', nullable: true }) fileContent: string;
  @Column({ type: 'varchar', length: 20, default: 'generated' }) status: string;
  @Column({ type: 'simple-json', nullable: true }) payments: Array<{ beneficiary: string; account: string; amount: number; reference: string }>;
  @CreateDateColumn() createdAt: Date;
}
