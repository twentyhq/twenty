import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AccountTier {
  PLATINUM = 'platinum',
  GOLD = 'gold',
  SILVER = 'bronze',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

@Entity('target_account')
@Index(['workspaceId', 'status'])
export class TargetAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  companyId: string;

  @Column({ nullable: false })
  companyName: string;

  @Column({ type: 'enum', enum: AccountTier, default: AccountTier.SILVER })
  tier: AccountTier;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.PENDING })
  status: AccountStatus;

  @Column({ type: 'simple-json', nullable: true })
  keyContacts: Array<{ id: string; name: string; role: string }>;

  @Column({ type: 'simple-array', nullable: true })
  decisionMakers: string[];

  @Column({ type: 'simple-json', nullable: true })
  engagementHistory: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  totalRevenue: number;

  @Column({ type: 'int', default: 0 })
  opportunityCount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('abm_campaign')
@Index(['workspaceId', 'status'])
export class ABMCampaignEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  targetAccountIds: string[];

  @Column({ type: 'enum', enum: AccountTier, nullable: true })
  targetTier: AccountTier;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  enrolledCount: number;

  @Column({ type: 'int', default: 0 })
  respondedCount: number;

  @CreateDateColumn()
  createdAt: Date;
}