import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum WaterfallPeriod { MONTHLY = 'monthly', QUARTERLY = 'quarterly', ANNUALLY = 'annually' }
export enum BookingType { NEW = 'new', RENEWAL = 'renewal', EXPANSION = 'expansion', CONTRACTION = 'contraction' }
export enum ChurnReason { COMPETITOR = 'competitor', BUDGET = 'budget', PRODUCT_FIT = 'product_fit', SUPPORT = 'support', MERGER = 'merger', OTHER = 'other' }
export enum RevenueSegment { ENTERPRISE = 'enterprise', MID_MARKET = 'mid_market', SMB = 'smb', STARTUP = 'startup' }

@Entity('revenue_waterfall')
@Index(['workspaceId'])
export class RevenueWaterfallEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ type: 'enum', enum: WaterfallPeriod, default: WaterfallPeriod.MONTHLY }) period: WaterfallPeriod;
  @Column({ type: 'date', nullable: false }) periodStart: Date;
  @Column({ type: 'date', nullable: false }) periodEnd: Date;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) openingARR: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) newBookings: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) expansionRevenue: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) contractionRevenue: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) churnedRevenue: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) closingARR: number;
  @Column({ type: 'float', default: 0 }) netRevenueRetention: number;
  @Column({ type: 'float', default: 0 }) grossRevenueRetention: number;
  @Column({ type: 'int', default: 0 }) totalAccounts: number;
  @Column({ type: 'int', default: 0 }) newAccounts: number;
  @Column({ type: 'int', default: 0 }) churnedAccounts: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('booking_entry')
@Index(['workspaceId', 'accountId'])
export class BookingEntryEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) accountId: string;
  @Column({ nullable: true }) dealId: string;
  @Column({ type: 'enum', enum: BookingType, default: BookingType.NEW }) type: BookingType;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false }) amount: number;
  @Column({ type: 'varchar', length: 3, default: 'USD' }) currency: string;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false }) arrImpact: number;
  @Column({ type: 'date', nullable: false }) bookingDate: Date;
  @Column({ type: 'date', nullable: true }) contractStart: Date;
  @Column({ type: 'date', nullable: true }) contractEnd: Date;
  @Column({ type: 'int', nullable: true }) contractMonths: number;
  @Column({ type: 'enum', enum: RevenueSegment, nullable: true }) segment: RevenueSegment;
  @Column({ type: 'varchar', length: 255, nullable: true }) salesRepId: string;
  @Column({ type: 'text', nullable: true }) notes: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('churn_entry')
@Index(['workspaceId', 'accountId'])
export class ChurnEntryEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) accountId: string;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false }) lostARR: number;
  @Column({ type: 'varchar', length: 3, default: 'USD' }) currency: string;
  @Column({ type: 'enum', enum: ChurnReason, default: ChurnReason.OTHER }) reason: ChurnReason;
  @Column({ type: 'text', nullable: true }) details: string;
  @Column({ type: 'date', nullable: false }) churnDate: Date;
  @Column({ type: 'date', nullable: true }) contractEndDate: Date;
  @Column({ type: 'boolean', default: false }) wasPreventable: boolean;
  @Column({ type: 'int', nullable: true }) customerLifetimeMonths: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true }) lifetimeValue: number;
  @Column({ type: 'enum', enum: RevenueSegment, nullable: true }) segment: RevenueSegment;
  @CreateDateColumn() createdAt: Date;
}

@Entity('expansion_entry')
@Index(['workspaceId', 'accountId'])
export class ExpansionEntryEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) accountId: string;
  @Column({ nullable: true }) dealId: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) expansionType: string;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false }) previousARR: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false }) newARR: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false }) expansionAmount: number;
  @Column({ type: 'varchar', length: 3, default: 'USD' }) currency: string;
  @Column({ type: 'date', nullable: false }) expansionDate: Date;
  @Column({ type: 'text', nullable: true }) driver: string;
  @Column({ type: 'int', nullable: true }) additionalSeats: number;
  @Column({ type: 'varchar', length: 255, nullable: true }) additionalProducts: string;
  @Column({ type: 'enum', enum: RevenueSegment, nullable: true }) segment: RevenueSegment;
  @CreateDateColumn() createdAt: Date;
}
