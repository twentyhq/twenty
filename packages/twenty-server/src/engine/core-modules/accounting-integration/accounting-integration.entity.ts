import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AccountingProvider {
  SIIGO = 'siigo',
  ALEGRA = 'alegra',
  QUICKBOOKS = 'quickbooks',
  XERO = 'xero',
  SAP_B1 = 'sap_b1',
  ODOO = 'odoo',
}

export enum SyncDirection {
  CRM_TO_ACCOUNTING = 'crm_to_accounting',
  ACCOUNTING_TO_CRM = 'accounting_to_crm',
  BIDIRECTIONAL = 'bidirectional',
}

@Entity('accounting_connection')
@Index(['workspaceId'])
export class AccountingConnectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ type: 'enum', enum: AccountingProvider })
  provider: AccountingProvider;

  @Column({ type: 'enum', enum: SyncDirection, default: SyncDirection.BIDIRECTIONAL })
  syncDirection: SyncDirection;

  @Column({ type: 'jsonb', nullable: true })
  credentials: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  accountMapping: Record<string, string>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  legalEntity: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'int', default: 0 })
  syncErrors: number;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('accounting_sync_log')
@Index(['workspaceId', 'connectionId'])
export class AccountingSyncLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  connectionId: string;

  @Column({ type: 'varchar', length: 50 })
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'varchar', length: 20 })
  direction: string;

  @Column({ type: 'varchar', length: 20, default: 'success' })
  status: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('tax_rule')
@Index(['workspaceId'])
export class TaxRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 10, default: 'CO' })
  country: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false })
  rate: number;

  @Column({ type: 'varchar', length: 50, default: 'IVA' })
  taxType: string;

  @Column({ type: 'boolean', default: false })
  isWithholding: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  withholdingRate: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('revenue_recognition')
@Index(['workspaceId', 'dealId'])
export class RevenueRecognitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  dealId: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  totalAmount: number;

  @Column({ type: 'varchar', length: 20, default: 'immediate' })
  recognitionType: string;

  @Column({ type: 'int', nullable: true })
  deferralMonths: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  recognized: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  deferred: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('sales_commission')
@Index(['workspaceId', 'repId'])
export class SalesCommissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  repId: string;

  @Column({ nullable: false })
  dealId: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  dealAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  commissionAmount: number;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  period: string;

  @CreateDateColumn()
  createdAt: Date;
}
