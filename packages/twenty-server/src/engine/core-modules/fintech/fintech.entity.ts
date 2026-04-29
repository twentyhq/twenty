import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum PaymentGateway {
  STRIPE = 'stripe',
  PAYU = 'payu',
  WOMPI = 'wompi',
  MERCADO_PAGO = 'mercado_pago',
}

export enum EInvoiceProvider {
  DIAN_CO = 'dian_co',
  SAT_MX = 'sat_mx',
  SRI_EC = 'sri_ec',
}

@Entity('embedded_payment')
@Index(['workspaceId', 'quoteId'])
export class EmbeddedPaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  quoteId: string;

  @Column({ nullable: false })
  dealId: string;

  @Column({ type: 'enum', enum: PaymentGateway })
  gateway: PaymentGateway;

  @Column({ type: 'varchar', length: 500, nullable: true })
  paymentLink: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'COP' })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalPaymentId: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('electronic_invoice')
@Index(['workspaceId', 'invoiceId'])
export class ElectronicInvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  invoiceId: string;

  @Column({ type: 'enum', enum: EInvoiceProvider })
  provider: EInvoiceProvider;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cufe: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  xmlContent: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pdfUrl: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('partner_channel')
@Index(['workspaceId'])
export class PartnerChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, default: 'reseller' })
  type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalCommissionPaid: number;

  @Column({ type: 'int', default: 0 })
  activeDeals: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('revenue_reconciliation')
@Index(['workspaceId'])
export class RevenueReconciliationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ nullable: true })
  dealId: string;

  @Column({ nullable: true })
  invoiceId: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 20, default: 'matched' })
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string;

  @CreateDateColumn()
  reconciledAt: Date;
}
