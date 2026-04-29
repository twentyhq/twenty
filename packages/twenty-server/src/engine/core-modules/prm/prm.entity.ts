import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PartnerTier { PLATINUM = 'platinum', GOLD = 'gold', SILVER = 'silver', BRONZE = 'bronze', PROSPECT = 'prospect' }
export enum PartnerStatus { PROSPECT = 'prospect', ONBOARDING = 'onboarding', ACTIVE = 'active', INACTIVE = 'inactive', CHURNED = 'churned' }
export enum DealRegStatus { PENDING = 'pending', APPROVED = 'approved', REJECTED = 'rejected', EXPIRED = 'expired', WON = 'won', LOST = 'lost' }
export enum MDFStatus { REQUESTED = 'requested', APPROVED = 'approved', REJECTED = 'rejected', SPENT = 'spent', RECONCILED = 'reconciled' }

@Entity('partner')
@Index(['workspaceId', 'tier'])
@Index(['workspaceId', 'status'])
export class PartnerEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) companyName: string;
  @Column({ type: 'enum', enum: PartnerTier, default: PartnerTier.PROSPECT }) tier: PartnerTier;
  @Column({ type: 'enum', enum: PartnerStatus, default: PartnerStatus.PROSPECT }) status: PartnerStatus;
  @Column({ type: 'varchar', length: 100, nullable: true }) partnerType: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) contactEmail: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) contactName: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) contactPhone: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) region: string;
  @Column({ type: 'simple-array', nullable: true }) industries: string[];
  @Column({ nullable: true }) channelManagerId: string;
  @Column({ type: 'float', default: 0 }) healthScore: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) commissionRate: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) totalRevenue: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) totalCommissionPaid: number;
  @Column({ type: 'int', default: 0 }) totalDeals: number;
  @Column({ type: 'int', default: 0 }) activeDeals: number;
  @Column({ type: 'int', default: 0 }) wonDeals: number;
  @Column({ type: 'int', default: 0 }) coursesCompleted: number;
  @Column({ type: 'int', default: 0 }) certifications: number;
  @Column({ type: 'date', nullable: true }) contractStartDate: Date;
  @Column({ type: 'date', nullable: true }) contractEndDate: Date;
  @Column({ type: 'simple-json', nullable: true }) benefits: Record<string, unknown>;
  @Column({ type: 'simple-json', nullable: true }) onboardingChecklist: Array<{ task: string; completed: boolean }>;
  @Column({ type: 'simple-array', nullable: true }) badges: string[];
  @Column({ type: 'int', default: 0 }) points: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('deal_registration')
@Index(['workspaceId', 'partnerId'])
@Index(['workspaceId', 'status'])
export class DealRegistrationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) partnerId: string;
  @Column({ nullable: false }) prospectCompanyName: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) prospectContactEmail: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) prospectContactName: string;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) estimatedValue: number;
  @Column({ type: 'varchar', length: 100, nullable: true }) product: string;
  @Column({ type: 'enum', enum: DealRegStatus, default: DealRegStatus.PENDING }) status: DealRegStatus;
  @Column({ type: 'int', default: 90 }) exclusivityDays: number;
  @Column({ type: 'date', nullable: true }) expiryDate: Date;
  @Column({ nullable: true }) conflictingPartnerId: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) conflictResolution: string;
  @Column({ nullable: true }) dealId: string;
  @Column({ nullable: true }) approverId: string;
  @Column({ type: 'text', nullable: true }) rejectionReason: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('mdf_request')
@Index(['workspaceId', 'partnerId'])
export class MDFRequestEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) partnerId: string;
  @Column({ nullable: false }) title: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'enum', enum: MDFStatus, default: MDFStatus.REQUESTED }) status: MDFStatus;
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false }) amountRequested: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) amountApproved: number;
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) amountSpent: number;
  @Column({ type: 'varchar', length: 100, nullable: true }) campaignType: string;
  @Column({ type: 'int', default: 0 }) leadsGenerated: number;
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 }) revenueGenerated: number;
  @Column({ nullable: true }) approverId: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('partner_spiff')
@Index(['workspaceId', 'partnerId'])
export class PartnerSPIFFEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) partnerId: string;
  @Column({ nullable: true }) dealId: string;
  @Column({ type: 'decimal', precision: 14, scale: 2 }) dealAmount: number;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) spiffRate: number;
  @Column({ type: 'decimal', precision: 14, scale: 2 }) spiffAmount: number;
  @Column({ type: 'varchar', length: 20, default: 'pending' }) paymentStatus: string;
  @Column({ type: 'varchar', length: 20, nullable: true }) period: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('partner_communication')
@Index(['workspaceId'])
export class PartnerCommunicationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) title: string;
  @Column({ type: 'text', nullable: false }) body: string;
  @Column({ type: 'varchar', length: 50, default: 'announcement' }) type: string;
  @Column({ type: 'simple-array', nullable: true }) targetTiers: string[];
  @Column({ type: 'simple-array', nullable: true }) targetIndustries: string[];
  @Column({ type: 'int', default: 0 }) readCount: number;
  @Column({ type: 'int', default: 0 }) totalRecipients: number;
  @CreateDateColumn() createdAt: Date;
}
