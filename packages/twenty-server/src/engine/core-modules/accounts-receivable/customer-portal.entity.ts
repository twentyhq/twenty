import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum PortalAccessStatus { ACTIVE = 'active', SUSPENDED = 'suspended', EXPIRED = 'expired' }
export enum AutopayStatus { ACTIVE = 'active', PAUSED = 'paused', CANCELLED = 'cancelled' }

// Customer portal access token
@Entity('ar_portal_access')
@Index(['workspaceId', 'accountId'])
@Index(['accessToken'], { unique: true })
export class PortalAccessEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) accountId: string;
  @Column({ type: 'varchar', length: 255, nullable: false }) contactEmail: string;
  @Column({ type: 'varchar', length: 255, nullable: false }) accessToken: string;
  @Column({ type: 'enum', enum: PortalAccessStatus, default: PortalAccessStatus.ACTIVE }) status: PortalAccessStatus;
  @Column({ type: 'timestamp', nullable: true }) lastAccessAt: Date;
  @Column({ type: 'timestamp', nullable: true }) expiresAt: Date;
  @CreateDateColumn() createdAt: Date;
}

// Autopay enrollment
@Entity('ar_autopay')
@Index(['workspaceId', 'accountId'])
export class AutopayEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) accountId: string;
  @Column({ type: 'enum', enum: AutopayStatus, default: AutopayStatus.ACTIVE }) status: AutopayStatus;
  @Column({ type: 'varchar', length: 50, nullable: false }) paymentMethod: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) stripeCustomerId: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) stripePaymentMethodId: string;
  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true }) maxAmount: number;
  @Column({ type: 'int', default: 0 }) successfulCharges: number;
  @Column({ type: 'int', default: 0 }) failedCharges: number;
  @Column({ type: 'timestamp', nullable: true }) lastChargedAt: Date;
  @CreateDateColumn() createdAt: Date;
}

// Early payment discount configuration
@Entity('ar_early_payment_discount')
@Index(['workspaceId'])
export class EarlyPaymentDiscountEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'int', nullable: false }) daysBeforeDue: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: false }) discountPercent: number;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'simple-array', nullable: true }) applicableSegments: string[];
  @CreateDateColumn() createdAt: Date;
}

// Collection scoring per account
@Entity('ar_collection_score')
@Index(['workspaceId', 'accountId'])
export class CollectionScoreEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) accountId: string;
  @Column({ type: 'float', default: 50 }) riskScore: number;
  @Column({ type: 'float', default: 50 }) paymentProbability: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) totalOutstanding: number;
  @Column({ type: 'int', default: 0 }) avgDaysLate: number;
  @Column({ type: 'int', default: 0 }) promisesKept: number;
  @Column({ type: 'int', default: 0 }) promisesBroken: number;
  @Column({ type: 'varchar', length: 20, default: 'standard' }) segment: string;
  @Column({ type: 'int', default: 0 }) callPriority: number;
  @CreateDateColumn() createdAt: Date;
}
