import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export enum CampaignChannel {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
  LINKEDIN = 'linkedin',
  GOOGLE_ADS = 'google_ads',
  FACEBOOK = 'facebook',
  EVENT = 'event',
}

export enum LeadScoreAction {
  EMAIL_OPEN = 'email_open',
  EMAIL_CLICK = 'email_click',
  PAGE_VISIT = 'page_visit',
  FORM_SUBMIT = 'form_submit',
  DEMO_REQUEST = 'demo_request',
  CHATBOT_INTERACTION = 'chatbot',
  PRICING_VISIT = 'pricing_visit',
}

@Entity('marketing_campaign')
@Index(['workspaceId', 'status'])
export class MarketingCampaignEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Column({ type: 'simple-array', nullable: true })
  channels: CampaignChannel[];

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  budget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  spent: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'simple-json', nullable: true })
  segmentCriteria: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  totalRecipients: number;

  @Column({ type: 'int', default: 0 })
  delivered: number;

  @Column({ type: 'int', default: 0 })
  opened: number;

  @Column({ type: 'int', default: 0 })
  clicked: number;

  @Column({ type: 'int', default: 0 })
  converted: number;

  @Column({ type: 'int', default: 0 })
  leadsGenerated: number;

  @Column({ type: 'int', default: 0 })
  dealsCreated: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  revenueAttributed: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('lead_score_rule')
@Index(['workspaceId'])
export class LeadScoreRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ type: 'enum', enum: LeadScoreAction })
  action: LeadScoreAction;

  @Column({ type: 'int', nullable: false })
  points: number;

  @Column({ type: 'int', default: -1 })
  decayPointsPerDay: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('lead_score')
@Index(['workspaceId', 'contactId'])
export class LeadScoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  contactId: string;

  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @Column({ type: 'varchar', length: 10, default: 'cold' })
  tier: string;

  @Column({ type: 'simple-json', nullable: true })
  scoreBreakdown: Record<string, number>;

  @Column({ type: 'boolean', default: false })
  isMQL: boolean;

  @Column({ type: 'boolean', default: false })
  isSQL: boolean;

  @Column({ type: 'timestamp', nullable: true })
  mqlAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sqlHandoffAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('campaign_touchpoint')
@Index(['workspaceId', 'dealId'])
export class CampaignTouchpointEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  workspaceId: string;

  @Column({ nullable: false })
  campaignId: string;

  @Column({ nullable: false })
  contactId: string;

  @Column({ nullable: true })
  dealId: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  touchType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmSource: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmMedium: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  utmCampaign: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  attributionWeight: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  revenueAttributed: number;

  @CreateDateColumn()
  createdAt: Date;
}
