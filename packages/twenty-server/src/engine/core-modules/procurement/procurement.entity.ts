import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PRStatus { DRAFT = 'draft', PENDING_APPROVAL = 'pending', APPROVED = 'approved', REJECTED = 'rejected', ORDERED = 'ordered', RECEIVED = 'received' }

@Entity('purchase_request')
@Index(['workspaceId', 'status'])
export class PurchaseRequestEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) requesterId: string;
  @Column({ nullable: true }) dealId: string;
  @Column({ nullable: false }) title: string;
  @Column({ type: 'text', nullable: true }) justification: string;
  @Column({ type: 'enum', enum: PRStatus, default: PRStatus.DRAFT }) status: PRStatus;
  @Column({ type: 'varchar', length: 100, nullable: true }) category: string;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) estimatedAmount: number;
  @Column({ type: 'simple-json', nullable: true }) items: Array<{ description: string; quantity: number; unitPrice: number }>;
  @Column({ nullable: true }) approverId: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) poId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('rfq')
@Index(['workspaceId'])
export class RFQEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) purchaseRequestId: string;
  @Column({ type: 'simple-array', nullable: true }) supplierIds: string[];
  @Column({ type: 'date', nullable: true }) deadline: Date;
  @Column({ type: 'simple-json', nullable: true }) responses: Array<{ supplierId: string; totalPrice: number; leadTimeDays: number; terms: string; receivedAt: string }>;
  @Column({ nullable: true }) selectedSupplierId: string;
  @Column({ type: 'varchar', length: 20, default: 'open' }) status: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('vendor_scorecard')
@Index(['workspaceId', 'supplierId'])
export class VendorScorecardEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) supplierId: string;
  @Column({ type: 'varchar', length: 20, nullable: false }) period: string;
  @Column({ type: 'float', default: 0 }) onTimeDeliveryRate: number;
  @Column({ type: 'float', default: 0 }) qualityScore: number;
  @Column({ type: 'float', default: 0 }) priceComplianceRate: number;
  @Column({ type: 'float', default: 0 }) responseTimeScore: number;
  @Column({ type: 'float', default: 0 }) overallScore: number;
  @CreateDateColumn() createdAt: Date;
}
