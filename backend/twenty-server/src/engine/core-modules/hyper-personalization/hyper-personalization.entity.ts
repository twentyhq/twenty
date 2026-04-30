import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PersonalizationChannel { EMAIL = 'email', WEB = 'web', IN_APP = 'in_app', SMS = 'sms', PUSH = 'push' }
export enum RuleOperator { EQUALS = 'equals', CONTAINS = 'contains', GREATER_THAN = 'greater_than', LESS_THAN = 'less_than', IN = 'in', NOT_IN = 'not_in' }
export enum EventType { PAGE_VIEW = 'page_view', CLICK = 'click', FORM_SUBMIT = 'form_submit', PURCHASE = 'purchase', EMAIL_OPEN = 'email_open', CUSTOM = 'custom' }

@Entity('personalization_profile')
@Index(['workspaceId'])
export class PersonalizationProfileEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) contactId: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) segment: string;
  @Column({ type: 'simple-json', nullable: true }) interests: string[];
  @Column({ type: 'simple-json', nullable: true }) preferences: Record<string, string>;
  @Column({ type: 'float', default: 0 }) engagementScore: number;
  @Column({ type: 'int', default: 0 }) totalInteractions: number;
  @Column({ type: 'timestamp', nullable: true }) lastInteractionAt: Date;
  @Column({ type: 'varchar', length: 10, nullable: true }) preferredLanguage: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) timezone: string;
  @Column({ type: 'simple-json', nullable: true }) contentAffinities: Record<string, number>;
  @Column({ type: 'simple-json', nullable: true }) channelPreferences: Record<string, number>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('personalization_rule')
@Index(['workspaceId'])
export class PersonalizationRuleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) name: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ type: 'varchar', length: 100, nullable: false }) targetField: string;
  @Column({ type: 'enum', enum: RuleOperator, default: RuleOperator.EQUALS }) operator: RuleOperator;
  @Column({ type: 'text', nullable: false }) value: string;
  @Column({ type: 'enum', enum: PersonalizationChannel, default: PersonalizationChannel.WEB }) channel: PersonalizationChannel;
  @Column({ type: 'simple-json', nullable: true }) contentVariant: Record<string, string>;
  @Column({ type: 'int', default: 0 }) priority: number;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'int', default: 0 }) impressions: number;
  @Column({ type: 'int', default: 0 }) conversions: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('personalization_event')
@Index(['workspaceId', 'contactId'])
@Index(['workspaceId', 'eventType'])
export class PersonalizationEventEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: false }) workspaceId: string;
  @Column({ nullable: false }) contactId: string;
  @Column({ type: 'enum', enum: EventType, default: EventType.CUSTOM }) eventType: EventType;
  @Column({ type: 'varchar', length: 255, nullable: true }) eventName: string;
  @Column({ type: 'simple-json', nullable: true }) properties: Record<string, string | number>;
  @Column({ type: 'varchar', length: 500, nullable: true }) pageUrl: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) referrer: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) device: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) browser: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) country: string;
  @CreateDateColumn() createdAt: Date;
}
